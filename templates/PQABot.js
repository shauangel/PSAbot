function start(){
    var myURL = "http://127.0.0.1:5000/welcome";
    console.log("out");
    $.ajax({
            url: myURL,
            type: "GET",
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                document.getElementById("content").innerHTML += '<font color="black">'+response.text+'</font><br>'
                document.getElementById("content").innerHTML += '<font color="black">testest</font><br>'
            },
            error: function(){
                console.log("error");
            }
        });
}

function send_to_bot(){
    var myURL = "http://127.0.0.1:5000/base_flow_rasa?message="+$("#user_input").val();
    
    document.getElementById("content").innerHTML += '<font color="blue">'+$("#user_input").val()+'</font><br>';
    console.log("myURL: "+myURL);
    
    $.ajax({
            url: myURL,
            type: "GET",
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                console.log(response.text); document.getElementById("content").innerHTML += '<font color="black">'+response.text+'</font><br>'
            },
            error: function(){
                console.log("error");
            }
        });
}

window.addEventListener("load", start, false);