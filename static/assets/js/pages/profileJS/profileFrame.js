function setLocalStorage(id){
    localStorage.setItem("forwardPage", "profileFrame");
    localStorage.setItem("postType", "innerPost");
    localStorage.setItem("singlePostId", id);
    setPage('mySinglePostFrame');
}

// 翻頁按鈕 START
var pageNumberPost = 1;
var pageNumberAnswer = 1;
var postSum, answerSum;
var pageSize=5;

function disabledButton(id){
    document.getElementById(id).disabled = true;
    document.getElementById(id).classList.add("disabledButton");
}

function abledButton(id){
    document.getElementById(id).disabled = false;
    document.getElementById(id).classList.remove("disabledButton");
}

function editPageNum(sum, buttonId){
    var backBtn, forBtn;
    var begin = 1;
    var temp;
    sum = parseInt(sum);
    
    if(buttonId=="backwardPagePost" || buttonId=="forwardPagePost"){
        temp = pageNumberPost+sum;
        pageNumberPost = temp;
        backBtn = "backwardPagePost";
        forBtn = "forwardPagePost";
        end = Math.ceil((postSum/5));
        getPostRecord("old");
    }
    else if(buttonId=="backwardPageAnswer" || buttonId=="forwardPageAnswer"){
        temp = pageNumberAnswer+sum;
        pageNumberAnswer = temp;
        backBtn = "backwardPageAnswer";
        forBtn = "forwardPageAnswer";
        end = Math.ceil((AnswerSum/5));
        getPostAnswer("old");
    }
    console.log("temp: "+temp);
    console.log("總頁數: "+end);
    
    if(temp == begin){
        disabledButton(backBtn);
    }
    else{
        abledButton(backBtn);
    }
    
    if(temp == end){
        disabledButton(forBtn);
    }
    else{
        abledButton(forBtn);
    }
}
// 翻頁按鈕 END

/////////////////// 貼文＆回覆紀錄 START ///////////////////
function showPostRecord(response){
    console.log("貼文");
    console.log(response);
    var content = "";
    for(var i=0; i<response.post_list.length; i++){
        var postId = response.post_list[i]._id;
        var title = response.post_list[i].title;
        var tag = response.post_list[i].tag;
        var time = new Date(response.post_list[i].time).toISOString();
        var score = 0;
        time = time.slice(0, 10);
        var askerName;
        if(response.post_list[i].incognito==true){
            askerName = "匿名";
        }
        else{
            askerName = response.post_list[i].asker_name;
        }

        for(var j=0; j<response.post_list[i].score.length; j++){
            score += response.post_list[i].score[j].score;
        }

        content += '<div class="col-lg-4 col-xl-3 col-sm-12">';
        content += '<a href="#" onclick="setLocalStorage(';
        content += "'";
        content += postId;
        content += "')";
        content += '">';

            content += '<div class="badge-box">';
                content += '<div class="sub-title">';
                    content += '<span>';
                    content += askerName;
                    content += '</span>';

                    content += '<span style="float:right;"><i class="fa fa-trophy" aria-hidden="true"></i>';
                    content += score;
                    content += '</span>';
                content += '</div>';

                content += '<div>';
                    content += title;
                content += '</div>';

                content += '<div style="margin-top: 20px;">';
                    for(var j=0; j<tag.length; j++){
                        content += '<label class="badge badge-default purpleLabel">';
                            content += tag[j].tag_name;
                        content += '</label>';
                    }

                    content += '<div>';
                        content += '<label class="badge purpleLabel2">';
                            content += time;
                        content += '</label>';
                    content += '</div>';

                content += '</div>';

            content += '</div>';
        content += '</a>';
        content += '</div>';
    }
    document.getElementById("post").innerHTML = content;
}

// 因為回覆紀錄不能重複顯示
var responsePostId = [];
function showAnswerRecord(response){
    var content = "";
    for(var i=0; i<response.post_list.length; i++){
        var postId = response.post_list[i]._id;
        var askerName;
        if(response.post_list[i].incognito==true){
            askerName = "匿名";
        }
        else{
            askerName = response.post_list[i].asker_name;
        }
        if(responsePostId.indexOf(postId)==-1){
            
            responsePostId.push(postId);
            var time = new Date(response.post_list[i].time).toISOString();
            time = time.slice(0, 10);

            var score = 0;
            for(var j=0; j<response.post_list[i].score.length; j++){
                score += response.post_list[i].score.score;
            }
            content += '<div class="col-lg-4 col-xl-3 col-sm-12">';
            content += '<a href="#" onclick="setLocalStorage(';
            content += "'";
            content += postId;
            content += "')";
            content += '">';

            content += '<div class="badge-box">';
                content += '<div class="sub-title">';
                    content += '<span>';
                    content += askerName;
                    content += '</span>';

                    content += '<span style="float:right;"><i class="fa fa-trophy" aria-hidden="true"></i>';
                    content += score;//score
                    content += '</span>';
                content += '</div>';

                content += '<div>';
                    content += '<span>';
                    content += response.post_list[i].title;
                    content += '</span>';
                content += '</div>';

                content += '<div style="margin-top: 20px;">';
                    for(var j=0; j<response.post_list[i].tag.length; j++){
                        content += '<label class="badge badge-default purpleLabel">';
                        content += response.post_list[i].tag[j].tag_name;
                        content += '</label>';
                    }

                    content += '<div>';
                        content += '<label class="badge purpleLabel2">';
                        content += time;
                        content += '</label>';
                    content += '</div>';

                content += '</div>';
            content += '</div>';
            content += '</a>';
            content += '</div>';
        }        
    }
    document.getElementById("response").innerHTML = content;
}

function getPostRecord(which){
    var myURL = head_url + "query_user_post_list";
    var id = localStorage.getItem("sessionID");
    var data = {_id: id, page_size: 5, page_number: pageNumberPost};
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("成功: 拿貼文紀錄（query_user_post_list）");
            postSum = response.post_count;
            
            // 把拿到的資料 從新到舊排序
            response.post_list.sort(function(a, b){
                return new Date(a.time) < new Date(b.time) ? 1 : -1;
            });
            
            showPostRecord(response);
        },
        error: function(){
            console.log("失敗: 拿貼文紀錄（query_user_post_list）");
        }
    });
    
    if(which=="new"){
        disabledButton("backwardPagePost");
    }
    else{
        abledButton("backwardPagePost");
    }
    if(postSum<=pageSize){
        disabledButton("forwardPagePost");
    }
}

function getAnswerRecord(which){
    var myURL = head_url + "query_user_response_list";
    var id = localStorage.getItem("sessionID");
    var data = {_id: id, page_size: pageSize, page_number: pageNumberPost};
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("成功: 拿回覆紀錄（query_user_response_list）");
            
            // 把拿到的資料 從新到舊排序
//            response.sort(function(a, b){
//                return new Date(a.time) < new Date(b.time) ? 1 : -1;
//            });
            console.log(response);
            
            answerSum = response.post_count;
            showAnswerRecord(response);
        },
        error: function(){
            console.log("失敗: 拿回覆紀錄（query_user_response_list）");
        }
    });
    
    if(which=="new"){
        disabledButton("backwardPageAnswer");
        responsePostId = [];
    }
    else{
        abledButton("backwardPageAnswer");
    }
    if(answerSum<=pageSize){
        disabledButton("forwardPageAnswer");
    }
}
/////////////////// 貼文＆回覆紀錄 END ///////////////////

function start(){
    getPostRecord("new");
    getAnswerRecord("new");
}

window.addEventListener("load", start, false);