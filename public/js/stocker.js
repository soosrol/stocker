function Stocker() { }

Stocker.setAlert = function () {
    var symbol = $("#symbol").val();
    var rule = $("#rule-select").val();
    var price = $("#price-input").val();
    var repeat = $("input[name='radios']:checked").val();
    var uid = firebase.auth().currentUser.uid;
    var email = firebase.auth().currentUser.email;

    var alertData = {
        email: email,
        uid: uid,
        symbol: symbol.toUpperCase(),
        rule: rule,
        price: price,
        repeat: repeat
    };

    var newAlertKey = firebase.database().ref().child('alerts').push().key;

    var updates = {};
    updates['/alerts/' + newAlertKey] = alertData;
    updates['/user-alerts/' + uid + '/' + newAlertKey] = alertData;

    return firebase.database().ref().update(updates);
}

Stocker.createEditElement = function(){
    var $element = $('<i class="action fa fa-pencil-square-o"></i>');
    $element.on('click', function (e) {
        var uid = firebase.auth().currentUser.uid;
        var $row = $(e.target.parentNode.parentNode);
        var id = $row.data('id');
        
        $("#modal-symbol-input").val($row.find('[name=symbol]').html());
        $("#modal-rule-select").val($row.find('[name=rule]').html());
        $("#modal-price-input").val($row.find('[name=price]').html());
        $('input:radio[name="modal-radios"][value="' + $row.find('[name=repeat]').html() + '"]').attr('checked', 'true');
        $('#modalform').attr("data-id", id);
        
        $('#edit-modal').modal('show');
    });
    return $element;
}

Stocker.createDeleteElement = function(){
    var $element = $('<i class="action fa fa-trash"></i>');
    $element.on('click', function (e) {
        var id = $(e.target.parentNode.parentNode).data('id');
        Stocker.deleteAlert(id);
    });
    return $element;
}

Stocker.updateAlertsList = function(alerts){
    var $list = $("#alert-list");

    if(!alerts) {
        $list.html('<span class="center">You have no alerts.</span>');
        return;
    }
    console.log(alerts);

    var newRows = [];

    for (var alertid in alerts){
        var symbol = alerts[alertid].symbol;
        var price = alerts[alertid].price;
        var rule = alerts[alertid].rule;
        var repeat = alerts[alertid].repeat;

        //Assemble row element
        var $alertRow = $('<tr></tr>')
        $alertRow.attr("data-id", alertid);
        var $symbolElement = $('<td name="symbol">' + symbol +'</td>');
        var $priceElement = $('<td name="price">' + price +'</td>');
        var $ruleElement = $('<td name="rule">' + rule +'</td>');
        var $repeatElement = $('<td name="repeat">' + repeat +'</td>');
        var $actionsElement = $('<td></td>');

        $actionsElement.append(Stocker.createEditElement());
        $actionsElement.append(Stocker.createDeleteElement());

        $alertRow.append($symbolElement);
        $alertRow.append($ruleElement);
        $alertRow.append($priceElement);
        $alertRow.append($repeatElement);
        $alertRow.append($actionsElement);
        

        newRows.push($alertRow);
    }
    
    $list.empty();
    for (var i in newRows) {
        $list.append(newRows[i])
    }
}

Stocker.getAlerts = function(){
    var uid = firebase.auth().currentUser.uid;
    firebase.database().ref().child('user-alerts').child(uid).on('value', function(results){
        console.log("Results:");
        Stocker.updateAlertsList(results.val());
    });

    firebase.database().ref().child('user-alerts').child(uid).on('child_removed', function(data) {
        Stocker.removeAlertRow(data.key);
    });
}



Stocker.getQuotesUrl = function (symbol, range) {
    var urlPattern = "https://chartapi.finance.yahoo.com/instrument/1.0/{SYMBOL}/chartdata;type=quote;range={RANGE}/json?callback=?";
    var url = urlPattern.replace("{SYMBOL}", symbol).replace("{RANGE}", range);
    return url;
}

Stocker.getQuotes = function (url) {
    return $.getJSON(url, function (data) {
        Stocker.drawChart(data);
    });
}

Stocker.drawChart = function (quotesData) {
    console.log(quotesData);
    var range = $('input[name=range]:checked').val();
    var ctx = $("#stock-chart");
    var quotes = new Array();
    quotesData.series.forEach(function (item) {
        if (item.Date)
            quotes.push({ x: Utils.parseYahooDate(item.Date), y: item.open });
        else
            quotes.push({ x: new Date(item.Timestamp * 1000), y: item.open });
    });

    if (Stocker.chart) {
        Stocker.chart.destroy();
    }

    Stocker.chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: quotesData.meta["Company-Name"],
                data: quotes,
                lineTension: 0,
                pointRadius: 1,
                pointHoverRadius: 5,
                backgroundColor: "rgba(92, 184, 92, 0.2)",
                borderColor: "rgba(92, 184, 92, 1)",
                borderWidth: 1,
                hoverBackgroundColor: "rgba(76, 174, 76, 0.4)",
                hoverBorderColor: "rgba(76, 174, 76, 1)"

            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    beginAtZero: true
                }]

            }
        }
    });
}

Stocker.deleteAlert = function(id){
    var uid = firebase.auth().currentUser.uid;
    firebase.database().ref().child('user-alerts').child(uid).child(id).remove();
    firebase.database().ref().child('alerts').child(id).remove(); // delete from common table as well, use later for inactivity
    //$("tr[data-id="+ id +"]").remove();
}

Stocker.updateAlert = function(id){
    var uid = firebase.auth().currentUser.uid;
    var symbol = $("#modal-symbol-input").val();
    var rule = $("#modal-rule-select").val();
    var price = $("#modal-price-input").val();
    var repeat = $("input[name='modal-radios']:checked").val();
    
    var alertData = {
        email: email,
        uid: uid,
        symbol: symbol.toUpperCase(),
        rule: rule,
        price: price,
        repeat: repeat
    };

    firebase.database().ref().child('user-alerts').child(uid).child(id).update(alertData);
    firebase.database().ref().child('alerts').child(id).update(alertData);
}

Stocker.removeAlertRow = function(id) {
  var row = $("tr[data-id="+ id +"]");
  row.remove();
}

