var Utils = function(){}

Utils.validateEmail = function(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

Utils.parseYahooDate = function(dateStr){
    var y = dateStr.toString().substring(0, 4);
    var m = dateStr.toString().substring(4, 6);
    var d = dateStr.toString().substring(6, 8);
    return new Date(m + '/' + d + '/' + y);
}