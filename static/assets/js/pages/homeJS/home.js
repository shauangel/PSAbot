function title(name, color, id) {
    this.name = name;
    this.color = color;
    this.id = id;
}

// An array containing all the projects with their information
var titles = [];

var color = ['#FFD700', '#CDC9C9', '#CD950C'];

function setLocalStorage(id){
    localStorage.setItem("singlePostId", id);
    localStorage.setItem("postType", "innerPost");
    setPage('mySinglePostFrame');
}

function start(){
    localStorage.removeItem("singlePostId");
    var myURL = head_url + "query_hot_post";
    console.log("HTTP GET - query_hot_post的URL: "+myURL);
    $.ajax({
        url: myURL,
        type: "GET",
        async: false, 
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("query_hot_post的回覆: ");
            console.log(response);
            
            for(var i=0; i<response.hot_post.length; i++){
                var getTitleURL = head_url+"query_inner_post";
                console.log("HTTP POST - query_inner_post的URL: "+getTitleURL);
                var data = {_id: response.hot_post[i]}
                console.log("query_inner_post的input: ");
                console.log(data);
                $.ajax({
                    url: getTitleURL,
                    type: "POST",
                    async: false, 
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    success: function(response){
                        console.log("query_inner_post的回覆: ");
                        console.log(response);
                        if(i>2){
                            titles.push(new title(response.title, "#545058", response._id));
                        }
                        else{
                            titles.push(new title(response.title, color[i], response._id));
                        }
                    },
                    error: function(){
                    }
                });
            }
            if(response.hot_post.length!=0){
               setTimeout(function(){
                    document.getElementById("titleDiv").innerHTML = '<i id="trophy" class="fa fa-code" aria-hidden="true" style="color: #545058; font-size: 25px; height: 5%; margin-top: 15px; margin-left: 15px; margin-right: 5px;"></i><span id="questionName">今日排行榜</span>';

                    var index = -1;
                    // Cacheing HTML elements
                    var trophy = document.querySelector('#trophy');
                    var questionName   = document.querySelector('#questionName');
                    var titleDiv = document.querySelector('#titleDiv');
                    setInterval(function(){
                        // Fade out
                        titleDiv.style.opacity = 0;

                        // Fade in 
                        setTimeout(function(){
                            index += 1;
                            questionName.innerHTML = titles[(index%(titles.length))].name;
                            trophy.style.color = titles[(index%titles.length)].color;
                            if((index%titles.length)>=3){
                                trophy.className = "fa fa-code animate__swing";
                            }
                            else{
                                trophy.className = "fa fa-trophy animate__swing";
                            }
                            titleDiv.onclick = function(){
                                setLocalStorage(titles[(index%(titles.length))].id);
                            };
                            titleDiv.style.opacity = 1;
                        },500);
                    }, 3000);
                }, 1000);
            }
        },
        error: function(){
//            console.log("error");
        }
    });
    
    
}

window.addEventListener("load", start, false);

