

//=================================== Event handlers ===================================
$("#sign-in-button").click(function(e){
    e.preventDefault();
    toggleSignIn();
});

$("#logout").click(function(e){
    e.preventDefault();
    toggleSignIn();
});

$("#set-alert-button").click(function(e){
    e.preventDefault();
    Stocker.setAlert();
});

$("#search-button").click(function(e){
    e.preventDefault();
    doSearch();
});

$('.decimalinput').blur(function(){
    var t = $(this);
    if(t.val())
        t.val(parseFloat(t.val()).toFixed(2));
});

$(".range-selector input").on('change', function () {
    console.log("Selected range: " + this.value);  //debug
    doSearch();
});

$("#modalform").submit(function(e){
    e.preventDefault();
    var id = e.target.attributes["data-id"].value;
    Stocker.updateAlert(id);
    $('#edit-modal').modal('hide');
});


function doSearch(){
    var symbol = $("#symbol").val();
    if(!symbol) return;    
    var range = $('input[name=range]:checked').val();
    var url = Stocker.getQuotesUrl(symbol, range);
    Stocker.getQuotes(url);
}


function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 
    && (charCode < 48 || charCode > 57))
        return false;

    return true;
}

function toggleSignIn() {
    if (firebase.auth().currentUser) {
        // [START signout]
        firebase.auth().signOut();
        // [END signout]
    } else {
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        if (email.length < 4) {
            alert('Please enter an email address.');
            return;
        }
        if (password.length < 4) {
            alert('Please enter a password.');
            return;
        }
        // Sign in with email and pass.
        // [START authwithemail]
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // [START_EXCLUDE]
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                console.error(error);
            }
            // [END_EXCLUDE]
        });
        // [END authwithemail]
    }
}

//=================================== End of event handlers ===================================

//Datepicker callback
function cb(start, end) {
    $('#reportrange').val(start.format('MM/DD/YYYY') + ' - ' + end.format('MM/DD/YYYY'));
}

//=================================== Firebase app init ===================================
function initApp() {
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var refreshToken = user.refreshToken;
            var providerData = user.providerData;
            $("#loginarea").hide();
            $("#page").show();
            $("#user-email").html(email)
            $("#logout").show();
            Stocker.getAlerts();
        } else {
            // User is signed out.
            $("#alert-list").empty();
            $("#page").hide();
            $("#logout").hide();
            $("#loginarea").show();
        }
    });
    // [END authstatelistener]  
}

//Onload
window.onload = function() {
      initApp(); 
};

//Document ready
$(document).ready(function(){
   
    
});