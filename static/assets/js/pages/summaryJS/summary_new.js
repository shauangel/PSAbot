function start(){
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
//    query_cache_by_id
    var myURL = head_url+"query_cache_by_id";
    console.log("myURL: "+myURL);
    var summaryId = localStorage.getItem("summaryId");
    var data = {id: summaryId};
//    var address = 'summaryResponse.json';
//    console.log("送出去的data: ");
    console.log(data);
    $.ajax({
        url: myURL,
        data: JSON.stringify(data),
        type: "POST",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log(response);
            summaryContent(response);
        },
        error: function(response){
        }
    });
}

function like(id){
    console.log("按了喜歡");
    var likeNum = document.getElementById(id);
    var number = parseInt(likeNum.innerHTML);
    number += 1;
    likeNum.innerHTML = number;
    console.log("id: "+id);
}

function dislike(id){
    console.log("按了不喜歡");
    var dislikeNum = document.getElementById(id);
    var number = parseInt(dislikeNum.innerHTML);
    number += 1;
    dislikeNum.innerHTML = number;
    console.log("id: "+id);
}

/////////////// 按讚、倒讚 START ///////////////
function objectInArrayThumb(obj, arr){//score, user_id
    for(var i=0; i<arr.length; i++){
        if(obj.score == arr[i].score && obj.user_id == arr[i].user_id){
            return true;
        }
    }
    return false;
}

function thumbs(score, answerId, tagId){
    //replyId==""，代表是按貼文的
    // web true代表是網路分數，動態變化的是讚旁邊的數字
    var myURL, data;
    var summaryId = localStorage.getItem("summaryId");
    var userId = localStorage.getItem("sessionID");
    console.log("score: "+score);
    console.log("answerId: "+answerId);
    console.log("summaryId: "+summaryId);
    console.log("userId: "+userId);
    
    console.log("tagId: "+tagId);
    var originState = document.getElementById(tagId).className;
    console.log("originState: "+originState);
    var upDown = originState.slice(15, originState.length);
    console.log("upDown: "+upDown);
    
    var tempId, scoreIcon = '<i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
    if(answerId==""){//代表是貼文
        tempId = "postLike"+summaryId;
        document.getElementById(tempId).className="fa fa-thumbs-o-up";
        
        tempId = "postDislike"+summaryId;
        document.getElementById(tempId).className="fa fa-thumbs-o-down";
        
        $("#postScore"+summaryId).html(scoreIcon+(parseInt($("#postScore"+summaryId).text())+parseInt(score)));
    }
    else{//代表是答案
        tempId = "answerLike"+answerId;
        document.getElementById(tempId).className="fa fa-thumbs-o-up";
        
        tempId = "answerDislike"+answerId;
        document.getElementById(tempId).className="fa fa-thumbs-o-down";
        
        $("#answerScore"+answerId).html(scoreIcon+(parseInt($("#answerScore"+answerId).text())+parseInt(score)));
    }
    
    console.log("切丸: "+originState.slice(0, 15));
    if(originState.slice(0, 15)=="fa fa-thumbs-o-"){//原本沒按
        data = {id: summaryId, answer_id: answerId, user_id: userId, mode: score};
        //tagId
        var temp = "fa fa-thumbs-"+upDown;
        console.log("temp: "+temp);
        document.getElementById(tagId).className= temp;
    }
    else{//原本有按
        data = {id: summaryId, answer_id: answerId, user_id: userId, mode: 0};
    }
    console.log("安祺data: ");
    console.log(data);
    var myURL = head_url + "update_cache_score";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 編輯貼文（update_inner_post）");
//            setPage('mySinglePostFrame');
            console.log(response);
        },
        error: function(response){
//            console.log("失敗: 編輯貼文（update_inner_post）");
            console.log(response);
        }
    });
    
}
/////////////// 按讚、倒讚 END ///////////////

function summaryContent(response){
    console.log("summary: ");
    console.log(response);
    // 問題
    var question = document.getElementById("stackoverflowQuestion");
    var likeScore = 0, dislikeScore = 0, score=0;
    
    for(var i=0; i<response.question.score.length; i++){
        score += response.question.score[i].user_vote;
//        if(response.question.score[i].user_vote==1){
//            likeScore += 1;
//        }
//        else if(response.question.score[i].user_vote==-1){
//            dislikeScore += 1;
//        }
    }
    
    var content = "";
    
    ///////////////////////////// 問題 START /////////////////////////////
    content += '<span style="font-size: 25px; font-weight: bold; width: auto; color: #505458;">';
        content += response.question.title;//標題
        content += '<span style="float: right;">';
            // vote START
            content += '<span style="font-size: 10px; color: #505458;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="外面網站的分數"></i>';
    
                content += response.question.vote;
            content += '</span>';
            // vote END
    
            // score START
            // id為: postScore+postId
            content += '<span id="postScore';
            content += localStorage.getItem("summaryId");
            content += '" style="font-size: 10px; color: #505458;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
                content += score;
            content += '</span>';
            // score END
        content += '</span>';
    content += '</span>';
    
    content += '<br>';
    
    content += '<a href="';
    content += response.link;
    content += '" target="_blank">點我看原文</a>';
    
    content += '<br><br>';
    
    content += '<div style="font-size: 16px; font-weight: bold; width: auto; color: #505458;">摘要: </div>';
    content += '<div style="margin-top: 10px; font-size: 12px;">';
        content += response.question.abstract;
    content += '</div>';

    
    content += '<br><br>';
    
    content += '<div style="font-size: 16px; font-weight: bold; width: auto; color: #505458;">原始內容: </div>';
    content += '<div style="margin-top: 10px; font-size: 12px;">';
        content += response.question.content;
    content += '</div>';

    // 倒讚 START
    // 倒讚的Id: postDislike+postId
    content += '<button name="post" type="button" class="scoreBtn" style="float: right; margin: 3px;" onclick="thumbs(\'-1\', \'\', \'postDislike';
    content += localStorage.getItem("summaryId");
    content += '\')"><i id="postDislike';
    content += localStorage.getItem("summaryId");
    content += '" class="fa fa-thumbs-o-down" aria-hidden="true"></i>';
    content += '</button>'; 
    // 倒讚 END
    
    // 讚 START
    // 讚的Id: postLike+postId
    content += '<button name="post" type="button" class="scoreBtn" style="float: right; margin: 3px;" onclick="thumbs(\'1\', \'\', \'postLike';
    content += localStorage.getItem("summaryId");
    content += '\')"><i id="postLike';
    content += localStorage.getItem("summaryId");
    content += '" class="fa fa-thumbs-o-up" aria-hidden="true"></i>';
    content += '</button>';
    // 讚 END
    
    content += '<span class="badge badge-default purpleLabel2" style=" background-color: white;">';
        content += response.time.slice(0, 10);
    content += '</span>';
    question.innerHTML = content;
    hljs.highlightAll();
    ///////////////////////////// 問題 END /////////////////////////////
    
    ///////////////////////////// 回覆 START /////////////////////////////
    var comment = document.getElementById("accordion");
    content = "";
    for(var i=0; i<response.answers.length; i++){
        var likeScore = 0, dislikeScore = 0, score=0;
        for(var j=0; j<response.answers[i].score.length; j++){
            score += response.answers[i].user_vote;
            if(response.answers[i].user_vote==1){
                likeScore += 1;
            }
            else if(response.answers[i].user_vote==-1){
                dislikeScore += 1;    
            }
        }
        content += '<div class="accordion-panel">';//第一個div
//        //----- 解答的標題 START -----//
            content += '<div class="accordion-heading" role="tab" id="heading';
            content += i;
            content += '">';
            
                content += '<h3 class="card-title accordion-title">';
                    content += '<a class="accordion-msg" data-toggle="collapse" data-parent="#accordion" href="#collapse';
                    content += i;
                    content += '" aria-expanded="true" aria-controls="collapse';
                    content += i;
                    content += '">';
                        content += '最佳解答'
                        content += (i+1);
                    
        
                        content += '<div style="float: right; font-size: 15px;">';
                            
                            // vote START
                            content += '<span style="font-size: 10px; color: #505458;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="外面網站的分數"></i>';
                            content += response.answers[i].vote;
                            content += '</span>';
                            // vote END

                            // score START
                            // id為: answerScore+answerId
                            content += '<span id="answerScore';
                            content += response.answers[i].id;
                            content += '" style="font-size: 10px; color: #505458;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
                            content += score;
                            content += '</span>';
                            // score END

                        content += '</div>';
                        
                    content += '</a>';
                content += '</h3>';
            content += '</div>';
            //----- 解答的標題 END -----//
        
            //----- 解答 START -----//
            content += '<div id="collapse';
            content += i;
            content += '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading';
            content += i;
            content += '">';

                content += '<div class="accordion-content accordion-desc">';
        
                    content += '<p>';
                        content += '<a href="';
                        content += response.link;
                        content += '#';
                        content += response.answers[i].id;
                        content += '" target="_blank">點我看原文</a><br><br>';
        
                        // 摘要 START
                        content += '<div style="font-size: 16px; font-weight: bold; width: auto; color: #505458;">摘要: </div>';
                        content += '<div style="margin-top: 10px; font-size: 12px;">';
                            content += response.answers[i].abstract;
                        content += '</div>';
                        // 摘要END
                        
                        // 原內容 START
                        content += '<div style="font-size: 16px; font-weight: bold; width: auto; color: #505458;">原始內容: </div>';
                            content += '<div style="margin-top: 10px; font-size: 12px;">';
                                content += response.answers[i].content;
                            content += '</div>';
                        // 原內容END
                        
                    content += '</p>';
                    content += '<div style="float: right; font-size: 15px;">';
                            
                            // 讚的Id: answerLike+answerId
                            content += '<button type="button" class="scoreBtn" onclick="thumbs(\'1\', \'';
                            content += response.answers[i].id;
                            content += '\', \'answerLike';
                            content += response.answers[i].id;
                            content += '\')"><i id="answerLike';
                            content += response.answers[i].id;
                            content += '" class="fa fa-thumbs-o-up" aria-hidden="true"></i></button>';
        
                            // 倒讚的Id: answerDislike+answerId
                            content += '<button type="button" class="scoreBtn" style="margin-right: 10px;" onclick="thumbs(\'-1\', \'';
                            content += response.answers[i].id;
                            content += '\', \'answerDislike';
                            content += response.answers[i].id;
                            content += '\')"><i id="answerDislike';
                            content += response.answers[i].id;
                            content += '" class="fa fa-thumbs-o-down" aria-hidden="true"></i></button>';
                    content += '</div>';
                content += '</div>';
            content += '</div>';
            //----- 解答 END -----//
        content += '</div>';
        ///////////////////////////// 回覆 END /////////////////////////////
    }
    comment.innerHTML = content;
}

window.addEventListener("load", start, false);