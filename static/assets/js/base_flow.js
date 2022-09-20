var head_url = "http://0.0.0.0:55001/";
var session_id;

//start
function start(){
    //到時候要用session_id
    
    session_id = window.prompt("請輸入mail的前綴(要用來當session_id)");
    console.log("session_id: "+ session_id);
    console.log("head_url: "+head_url);
    
    //傳session_start
    var myURL = head_url + "session_start?sender_id="+session_id;
    console.log("myURL: "+myURL);
    $.ajax({
        url: myURL,
        type: "GET",
        dataType: "json",
        async:false,
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("response: "+response);
            console.log(response.message);
        },
        error: function(){
            console.log("error");
        }
    });
    
    //start
    var myURL = head_url + "welcome?sender_id="+session_id;
    console.log("myURL: "+myURL);
    $.ajax({
        url: myURL,
        type: "GET",
        dataType: "json",
        async:false,
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("response: "+response);
            console.log(response.text);
            document.getElementById("content").innerHTML += '<font color="black">'+response.text+'</font><br>';
        },
        error: function(){
            console.log("error");
        }
    });
}

//send資料給rasa
function send_to_bot(){
    document.getElementById("content").innerHTML += '<font color="blue">'+$("#user_input").val()+'</font><br>';
    
    
    
    var myURL = head_url + "base_flow_rasa?message="+$("#user_input").val()+"&sender_id="+session_id;
    myURL = encodeURI(myURL);//處理中文字
    console.log("myURL: "+myURL);
    $.ajax({
        url: myURL,
        type: "GET",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log(response.text);
            document.getElementById("content").innerHTML += '<font color="black">'+response.text+'</font><br>';
            $("#user_input").val("");
        },
        error: function(){
            console.log("error");
        }
    });
}

window.addEventListener("load", start, false);