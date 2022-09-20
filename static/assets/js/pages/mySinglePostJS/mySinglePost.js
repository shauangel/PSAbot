var pageNumber = 1;
var forwardPage, postType;

function setLocalStorage(id){
    localStorage.setItem("replyId", id);
    setPage('editReplyFrame');
}

/////////////// 刪除貼文/回覆 START ///////////////
function getAnswerOwner(postId, answerId){
    var data = {_id: postId}, temp;
    var myURL = head_url + "query_inner_post";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log(response);
            for(var i=0; i<response.answer.length; i++){
                if(response.answer[i]._id == answerId){
                    temp = response.answer[i].replier_id;
                    break;
                }
            }
        },
        error: function(response){
        }
    });
    return temp;
}

function deletePostOrAnswer(){
    var data, deleteType = localStorage.getItem("delete");
    var postId = localStorage.getItem("singlePostId");
    var answerId = localStorage.getItem("answerId");
    // 有四種情況「faq貼文」、「faq回覆」、「innerPost貼文」、「innerPost回覆」
    
    //--- faq貼文 START ---//
    if(postType=="faq" && deleteType=="post"){
        data = {_id: postId};
//        console.log("刪除faq的貼文: ");
//        console.log(data);
        
        var myURL = head_url + "delete_faq_post";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                localStorage.removeItem("delete");
                localStorage.removeItem("singlePostId");
                setPage("FaqFrame");
            },
            error: function(response){
            }
        });
    }
    //--- faq貼文 END ---//
    
    //--- faq回覆 START ---//
    else if(postType=="faq" && deleteType=="answer"){
        data = {faq_id: postId, answer_id: answerId};
        console.log("刪除faq的回覆: ");
        console.log(data);
        
        var myURL = head_url + "delete_faq_answer";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
//                console.log("API名稱: delete_faq_answer");
                console.log(response);
                localStorage.removeItem("delete");
                localStorage.removeItem("answerId");
                location.reload();
            },
            error: function(response){
            }
        });
    }
    //--- faq回覆 END ---//
    
    //--- innerPost貼文 START ---//
    else if(postType=="innerPost" && deleteType=="post"){
        data = {_id: postId};
//        console.log("刪除innerPost的貼文: ");
//        console.log(data);
        
        var myURL = head_url + "delete_inner_post";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                localStorage.removeItem("delete");
                localStorage.removeItem("singlePostId");
                setPage("postRowFrame");
            },
            error: function(response){
            }
        });
        
        var myURL = head_url + "delete_notification?post_id="+postId;
        console.log("HTTP GET - delete_notification的URL: "+myURL);
        $.ajax({
            url: myURL,
            type: "GET",
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                console.log("delete_notification的回覆: ");
                console.log(response)
            },
            error: function(response){
            }
        });
    }
    //--- innerPost貼文 END ---//
    
    //--- innerPost回覆 START ---//
    else if(postType=="innerPost" && deleteType=="answer"){
        data = {post_id: postId, _id: answerId, replier_id: getAnswerOwner(postId, answerId)};
//        console.log("刪除innerPost的回覆: ");
//        console.log(data);
        
        var myURL = head_url + "delete_inner_post_response";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
//                console.log("API名稱: delete_inner_post_response");
//                console.log(response);
                localStorage.removeItem("delete");
                localStorage.removeItem("answerId");
//                setPage("mySinglePostFrame");
                location.reload();
            },
            error: function(response){
                console.log(response);
            }
        });
    }
    //--- innerPost回覆 END ---//
}

function wantDeletePost(){
    document.getElementById("deleteTitleInModal").innerHTML = "刪除貼文";
    $("#exampleModal").modal('show');
    
    localStorage.setItem("delete", "post");
}

function wantDeleteAnswer(answerId){
    document.getElementById("deleteTitleInModal").innerHTML = "刪除回覆";
    $("#exampleModal").modal('show');
    
    localStorage.setItem("delete", "answer");
    localStorage.setItem("answerId", answerId);
}
///////////////  刪除貼文/回覆 END ///////////////


/////////////// 按讚、倒讚 START ///////////////
function objectInArrayThumb(obj, arr){//score, user_id
    for(var i=0; i<arr.length; i++){
        if(obj.score == arr[i].score && obj.user_id == arr[i].user_id){
            return true;
        }
    }
    return false;
}

function thumbs(score, answerId, targetUserId){
    //replyId==""，代表是按貼文的
    var myURL, data;
    var postId = localStorage.getItem("singlePostId");
    var userId = localStorage.getItem("sessionID");
    var tempId, scoreIcon = '<i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
    
    if(score==1){
        if(answerId==""){// post like
            tempId = "postLike"+postId;
            console.log("like's Id: "+tempId);
            if(document.getElementById(tempId).className == "fa fa-thumbs-up"){
                document.getElementById(tempId).className = "fa fa-thumbs-o-up";
                console.log("減1分");
                $("#postScore"+postId).html(scoreIcon + (parseInt($("#postScore"+postId).text())-1));
            }
            else{
                document.getElementById(tempId).className = "fa fa-thumbs-up";
                console.log("加1分");
                $("#postScore"+postId).html(scoreIcon + (parseInt($("#postScore"+postId).text())+1));
            }
            tempId = "postDislike"+postId;
            console.log("dislike's ID: "+tempId);
            if(document.getElementById(tempId).className == "fa fa-thumbs-down"){
                console.log("家1分");
                $("#postScore"+postId).html(scoreIcon + (parseInt($("#postScore"+postId).text())+1));
            }
            document.getElementById(tempId).className = "fa fa-thumbs-o-down";
        }
        else{// answer like
            
            tempId = "answerLike"+answerId;
            if(document.getElementById(tempId).className=="fa fa-thumbs-up"){
                document.getElementById(tempId).className = "fa fa-thumbs-o-up";
                $("#answerScore"+answerId).html(scoreIcon + (parseInt($("#answerScore"+answerId).text())-1));
            }
            else{
                document.getElementById(tempId).className = "fa fa-thumbs-up";
                $("#answerScore"+answerId).html(scoreIcon + (parseInt($("#answerScore"+answerId).text())+1));
            }
            
            tempId = "answerDislike"+answerId;
            if(document.getElementById(tempId).className=="fa fa-thumbs-down"){
                $("#answerScore"+answerId).html(scoreIcon + (parseInt($("#answerScore"+answerId).text())+1));
            }
            document.getElementById(tempId).className = "fa fa-thumbs-o-down";
        }
    }
    else{
        if(answerId==""){//post dislike
            
            tempId = "postDislike"+postId;
            if(document.getElementById(tempId).className=="fa fa-thumbs-down"){//有案->沒案
                document.getElementById(tempId).className = "fa fa-thumbs-o-down";
                $("#postScore"+postId).html(scoreIcon + (parseInt($("#postScore"+postId).text())+1));
            }
            else{
                document.getElementById(tempId).className = "fa fa-thumbs-down";
                $("#postScore"+postId).html(scoreIcon + (parseInt($("#postScore"+postId).text())-1));
            }
            
            tempId = "postLike"+postId;
            if(document.getElementById(tempId).className=="fa fa-thumbs-up"){
                $("#postScore"+postId).html(scoreIcon + (parseInt($("#postScore"+postId).text())-1));
            }
            document.getElementById(tempId).className = "fa fa-thumbs-o-up";
        }
        else{// answer dislike
            
            tempId = "answerDislike"+answerId;
            if(document.getElementById(tempId).className=="fa fa-thumbs-down"){
                document.getElementById(tempId).className = "fa fa-thumbs-o-down";
                $("#answerScore"+answerId).html(scoreIcon + (parseInt($("#answerScore"+answerId).text())+1));
                console.log("加1分");
            }
            else{
                document.getElementById(tempId).className = "fa fa-thumbs-down";
                $("#answerScore"+answerId).html(scoreIcon + (parseInt($("#answerScore"+answerId).text())-1));
                console.log("減1分");
            }
            tempId = "answerLike"+answerId;
            if(document.getElementById(tempId).className == "fa fa-thumbs-up"){
                $("#answerScore"+answerId).html(scoreIcon + (parseInt($("#answerScore"+answerId).text())-1));
                console.log("減1分");
            }
            document.getElementById(tempId).className = "fa fa-thumbs-o-up";
        }
    }
    
    if(postType=="faq"){//代表是faq
        data = {faq_id: postId, answer_id: answerId, user: userId};
        console.log("data: ");
        console.log(data);
        if(score == 1){
            myURL = head_url + "like_faq_post";
//            console.log("API為: like_faq_post");
        }
        else{
            myURL = head_url + "dislike_faq_post";
//            console.log("API為: dislike_faq_post");
        }
        console.log("myURL: "+myURL);
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                console.log(response);
//                window.location.reload();
            },
            error: function(response){
            }
        });
    }
    else if(postType=="innerPost"){//代表是innerPost
        data = {post_id: postId, response_id: answerId, user: userId, target_user: targetUserId};
        console.log(data);
        if(score == 1){
            myURL = head_url + "like_inner_post";
//            console.log("API為: like_inner_post");
        }
        else{
            myURL = head_url + "dislike_inner_post";
//            console.log("API為: dislike_inner_post");
        }
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
//                console.log(response);
//                window.location.reload();
            },
            error: function(response){
            }
        });
    }
}
/////////////// 按讚、倒讚 END ///////////////


/////////////// 抓初始資料 START ///////////////
function showQuestion(response){
    console.log("出使資料: ");
    console.log(response);
    var id, title, question, tags, time, isDiscussion=false;
    //----- 檢查是哪種貼文（faq vs inner） START -----//
    switch(postType){
        case "faq":
            title = response.question.title;
            question = response.question.content;
            tags = response.tags;
            break;
        case "innerPost":
            title = response.title;
            question = response.question;
            tags = response.tag;
            isDiscussion = response.is_discuss;
            break;
    }
    //----- 檢查是哪種貼文（faq vs inner） END -----//
    
    id = response._id;
    time = new Date(response.time);
    time = time.toISOString();
    time = time.slice(0, 10);


    content = "";
    content += '<div class="badge-box">';
        content += '<div class="sub-title">';
            
            //----- 貼文ID or 發文者 START -----//
            content += '<span>';
            if(postType=="faq"){
                content += "FAQ的ID #";
                content += id;
            }
            else if(postType=="innerPost"){
                if(response.incognito==true){
                    content += "匿名";
                }
                else{
                    content += response.asker_name;
                }
            }
            content += '</span>';
            //----- 貼文ID or 發文者 END -----//
            
            //----- 分數 START -----//
            var questionScore=0, questionVote=0, like=0, dislike=0;
            if(postType=="faq"){
                questionVote = response.question.vote;//question的是字串
                for(var i=0; i<response.question.score.length; i++){
                    questionScore += parseInt(response.question.score[i].score);
                }
            }
            else if(postType=="innerPost"){
                for(var i=0; i<response.score.length; i++){
                    questionScore += parseInt(response.score[i].score);
                }
            }
            
            if(postType=="faq"){
                // score START
                content += '<span id="postScore';
                content += id;
                content += '" style="float:right;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
                content += questionScore;
                content += '</span>';
                // score END

                // vote（管理者輸入的分數） START
                content += '<span style="float:right; margin-left: 4px;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="外面網站的分數"></i>';
                content += questionVote;
                content += '</span>';
                // vote（管理者輸入的分數） END
            }
            else if(postType=="innerPost"){
                // score START
                content += '<span id="postScore';
                content += id;
                content += '" style="float:right;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
                content += questionScore;
                content += '</span>';
                // score END
            }
    
            //----- 分數 END -----//
        content += '</div>';

        content += '<div>';
            //----- 貼文標題 START -----//
            content += '<span><h5>';
            content += title;
            content += '</h5></span>';
            //----- 貼文標題 END -----//

            //----- 貼文內容 START -----//
            content += '<div>';
                content += '<span>';
    console.log("共同討論？ "+isDiscussion);
                if(isDiscussion==true){ // 是共同討論
                    question = discussionPostContent(response.room_id, question);
                }
                else{ // 不是共同討論
                    question = question.replaceAll('\n', '<br>');
                }
                content += question;
                content += '</span>';
            content += '</div>';
            //----- 貼文內容 END -----//
            
            //----- 貼文TAGs START -----//
            content += '<div style="margin-top: 20px;">';
            for(var i=0; i<tags.length; i++){
                content += '<label class="badge badge-default purpleLabel">';
                    content += tags[i].tag_name;
                content += '</label>';
            }
            content += '</div>';
            //----- 貼文TAGs END -----//

        content += '<div>';
            //----- 貼文時間 START -----//
            content += '<label class="badge purpleLabel2">';
            content += time;
            content += '</label>';
            //----- 貼文時間 END -----//
            
            var userId = localStorage.getItem("sessionID");
            var postId=localStorage.getItem("singlePostId"), postOwnerId;
            var scoreArray;
            if(postType=="faq"){
                postOwnerId = "manager";
                scoreArray = response.question.score;
            }
            else if(postType=="innerPost"){
                postOwnerId = response.asker_id;
                scoreArray = response.score;
            }
    
            
                
                //----- 檢查有沒有按讚 START -----//
                content += '<div style="float:right;">';
                content += '<button type="button" class="scoreBtn" onclick="thumbs(';
                content += "'1', '', '";
                content += postOwnerId;
                content += "')";
                content += '">';
                
                var temp = {score: 1, user_id: userId};
                // 讚的Id: postLike+貼文id
                if(objectInArrayThumb(temp, scoreArray)){
                    content += '<i id="postLike';
                    content += postId;
                    content += '" class="fa fa-thumbs-up" aria-hidden="true"></i>';
                }
                else{
                    content += '<i id="postLike';
                    content += postId;
                    content += '" class="fa fa-thumbs-o-up" aria-hidden="true"></i>';
                }
                content += '</button>';
                //----- 檢查有沒有按讚 END -----//
                    
                    
                //----- 檢查有沒有倒讚 START -----//
                content += '<button type="button" class="scoreBtn" onclick="thumbs(';
                content += "'-1', '', '";
                content += postOwnerId;
                content += "')";
                content += '">';

                var temp = {score: -1, user_id: userId};
                // 倒讚的Id: postDislike+貼文id
                if(objectInArrayThumb(temp, scoreArray)){
                    content += '<i id="postDislike';
                    content += postId;
                    content += '" class="fa fa-thumbs-down" aria-hidden="true"></i>';
                }
                else{
                    content += '<i id="postDislike';
                    content += postId;
                    content += '" class="fa fa-thumbs-o-down" aria-hidden="true"></i>';
                }
                content += '</button>';
                //----- 檢查有沒有倒讚 END -----//
            
            content += '</div>';
        content += '</div>';
    content += '</div>';

    document.getElementById("question").innerHTML = content;
    hljs.highlightAll();
}

function showAnswers(response){
    console.log(response);
    var content = "";
    var tempAnswerLength;
    var userId=localStorage.getItem("sessionID"), role=localStorage.getItem("role");
    switch(postType){
        case "faq":
            tempAnswerLength = response.answers.length;
            break;
        case "innerPost":
            response.answer.sort(function(a, b){
                return a.time < b.time ? 1 : -1;
            });
            tempAnswerLength = response.answer.length;
            break;
    }
    
    if(tempAnswerLength==0){
        content += '<div class="title card-header">目前暫無回答</div>';
    }
    for(var i=0; i<tempAnswerLength; i++){
        
        var answerTitle, answerContent, answerTime, answerScore=0, answerId, answerOwnerId, scoreArray;
        
        var answerVote;
        
        var like=0, dislike=0;
        
        switch(postType){
            case "faq":
                answerId = response.answers[i].answer_id;
                answerOwnerId = "manager";
                answerTitle = "回覆的ID #" + answerId;
                answerContent = response.answers[i].content;
//                answerTime = new Date(response.time);
//                answerTime = answerTime.toISOString();
//                answerTime = answerTime.slice(0, 10);
                answerTime = "----/--/--"
                scoreArray = response.answers[i].score;
                for(var j=0; j<scoreArray.length; j++){
                    answerScore += response.answers[i].score[j].score;
                }
                answerVote = response.answers[i].vote;
                if(answerScore==0){
//                    qusetionScore = 0;
                    for(var j=0; j<response.answers[j].score.length; j++){
                        answerScore += response.answers[j].score[j].score;
                        if(response.answers[j].score[j].score==1){
                            like+=1;
                        }
                        else if(response.answers[j].score[j].score==-1){
                            dislike+=1;
                        }
                    }
                }
                else{
                    for(var j=0; j<response.answers[j].score.length; j++){
                        if(response.answers[j].score[j].score==1){
                            like+=1;
                        }
                        else if(response.answers[j].score[j].score==-1){
                            dislike+=1;
                        }
                    }
                }
                break;
                
            case "innerPost":
                if(response.answer[i].incognito == true){
                    answerTitle = "匿名";
                }
                else{
                    answerTitle = response.answer[i].replier_name;
                }
                answerId = response.answer[i]._id;
                answerOwnerId = response.answer[i].replier_id;
//                answerContent = response.answer[i].response.replaceAll('\n', '<br>');
                answerContent = response.answer[i].response;
                answerTime = new Date(response.answer[i].time);
                answerTime = answerTime.toISOString();
                answerTime = answerTime.slice(0, 10);
                scoreArray = response.answer[i].score;
                for(var j=0; j<scoreArray.length; j++){
                    answerScore += response.answer[i].score[j].score;
                }
                break;
        }
        content += '<div class="col-12">';
            content += '<div class="badge-box">';
                content += '<div class="sub-title">';
                    content += '<span>';
                        content += answerTitle;
                    content += '</span>';

                    //----- 編輯、刪除按鈕 START -----//
        
                    // 編輯＋刪除按鈕
                    if((postType=="innerPost" && response.answer[i].replier_id==userId) || (postType=="faq" && role=="manager")){
                        content += '<button type="button" class="scoreBtn" onclick="setLocalStorage(';
                        content += "'";
                        content += answerId;
                        content += "'";
                        content += ')"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>';
                        content += '<button type="button" class="scoreBtn" onclick="wantDeleteAnswer(\'';
                        content += answerId;
                        content += '\')"><i class="fa fa-trash-o" aria-hidden="true"></i></button>';
                    }
                    // 只有刪除按按鈕
                    else if(postType=="innerPost" && role=="manager"){
                        content += '<button type="button" class="scoreBtn" onclick="wantDeleteAnswer(\'';
                        content += answerId;
                        content += '\')"><i class="fa fa-trash-o" aria-hidden="true"></i></button>';
                    }
                    //----- 編輯、刪除按鈕 END -----//
                    
                    //----- 回覆分數 START -----//
                    if(postType=="faq"){
                            content += '<span id="answerScore';
                            content += answerId;
                            content += '" style="float:right;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
                            content += answerScore;
                            content += '</span>';
        //                content += '</div>';

                        // vote（管理者輸入的分數） START
                            content += '<span style="float:right; margin-left: 4px;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="外面網站的分數"></i>';
                            content += answerVote;
                            content += '</span>';
                        // vote（管理者輸入的分數） END
                    }
                    else{
                        content += '<span id="answerScore';
                        content += answerId;
                        content += '" style="float:right;"><i class="fa fa-trophy" aria-hidden="true"></i>';
                            content += answerScore;
                        content += '</span>';
                    }
                    //----- 回覆分數 END -----//
                content += '</div>';

                content += '<span>';
                    content += answerContent;
                content += '</span>';
//                        <span><br><code>hello world</code></span>

                content += '<div style="margin-top: 20px;">';
                    
                    content += '<label class="badge purpleLabel2">';
                        content += answerTime;
                    content += '</label>';
                    
                       // 檢查有沒有按讚 START //
                        content += '<div style="float:right;">';
                        content += '<button type="button" style="margin:3px;" class="scoreBtn" onclick="thumbs(';
                        content += "'1', '";
                        content += answerId;
                        content += "', '";
                        content += answerOwnerId;
                        content += "')";
                        content += '">';

                        var temp = {score: 1, user_id: userId};
                        // 讚的Id: answerLike+回覆id
                        if(objectInArrayThumb(temp, scoreArray)){
                            content += '<i id="answerLike';
                            content += answerId;
                            content += '" class="fa fa-thumbs-up" aria-hidden="true"></i>';
                        }
                        else{
                            content += '<i id="answerLike';
                            content += answerId;
                            content += '" class="fa fa-thumbs-o-up" aria-hidden="true"></i>';
                        }
                        // 檢查有沒有按讚 END
                        content += '</button>';

                        content += '<button type="button" style="margin:3px;" class="scoreBtn" onclick="thumbs(';
                        content += "'-1', '";
                        content += answerId;
                        content += "', '";
                        content += answerOwnerId;
                        content += "')";
                        content += '">';

                        // 檢查有沒有按倒讚 START
                        var temp = {score: -1, user_id: userId};
                        // 倒讚的Id: answerDislike+回覆id
                        if(objectInArrayThumb(temp, scoreArray)){
                            content += '<i id="answerDislike';
                            content += answerId;
                            content += '" class="fa fa-thumbs-down" aria-hidden="true"></i>';
                        }
                        else{
                            content += '<i id="answerDislike';
                            content += answerId;
                            content += '" class="fa fa-thumbs-o-down" aria-hidden="true"></i>';
                        }
                        // 檢查有沒有按倒讚 END
                        content += '</button>';
                    
                    content += '</div>';
                content += '</div>';
            content += '</div>';
        content += '</div>';
    }

    document.getElementById("response").innerHTML = content;
    hljs.highlightAll();
}

// 處理共同討論的innerPost
function discussionPostContent(roomId, indexVal){
    // 先去拿聊天紀錄
    var data = {_id: roomId}, temp;
    var myURL = head_url + "query_chat";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log(response);
            data = response.chat_logs;
            
        },
        error: function(response){
        }
    });
    
    var content = "", img = "";
    
    var userId = localStorage.getItem("sessionID");
    var userImgs = [];
    var userIds = [];
    var i;
    for(var j=0; j<indexVal.length; j++){
        i = indexVal[j];
        // 先去處理照片的部分 START
        var temp = userIds.indexOf(data[i].user_id);
        if(temp == -1){ //代表還沒拿到照片
            if(data[i].user_id!="PSAbot" && check_member_is_incognito(roomId, data[i].user_id)){
                console.log("是匿名");
                userImgs[userImgs.length] = "../static/images/discussionImg.png";
            }
            else{
                console.log("不是匿名");
                userImgs[userImgs.length] = getChatroomUserImg(data[i].user_id);
            }
            
            img = userImgs[userImgs.length-1];
        }
        else{
            img = userImgs[temp];
        }
        // 先去處理照片的部分 END
        
        // 重建歷史紀錄 START
        if(data[i].user_id == userId){ //代表是自己說話
            
            // 沒有label START
            content += '<div class="d-flex justify-content-end mb-4">';
            content += '<div class="msg_cotainer_send">';
            content += data[i].content;
            content += '</div>';
            content += '<div class="img_cont_msg">';
            content += '<img src="';
            content += img;
            content += '" class="chatImg">';
            content += '</div>';
            content += '</div>';
            // 沒有label END

        }
        else{
            // 沒有label的 START
            content += '<div class="d-flex justify-content-start mb-4">';
            content += '<div class="img_cont_msg">';
            content += '<img src="';
            content += img;
            content += '" class="chatImg" style="background-color: #5D478B;">';
            content += '</div>';
            content += '<div class="msg_cotainer">';
            content += data[i].content;
            content += '</div>';
            content += '</div>';
            // 沒有label的 END
        }
    }
    return content;
    // 重建歷史紀錄 END
}

function start(){
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    postType = localStorage.getItem("postType");
    var userId = localStorage.getItem("sessionID");
    var role = localStorage.getItem("role");
    
    var afterURL;
    switch(postType){
        case "faq":
            afterURL = "query_faq_post";
            break;
        case "innerPost":
            afterURL = "query_inner_post";
            break;
    }
    var myURL = head_url + afterURL;
    
    var singlePostId = localStorage.getItem("singlePostId");
    var data = {"_id": singlePostId};
    
    var content = "";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){

            //----- 顯示問題 START -----//
            content += '<div class="title">問題</div>';
            // --- 編輯按鈕 ---//
            if((postType=="innerPost" && response.asker_id==userId) || (postType=="faq" && role=="manager")){
                // 編輯
                content += '<button type="button" class="scoreBtn" onclick="setPage(';
                content += "'editPostFrame'";
                content += ')"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>';
            }
            
            // --- 刪除貼文按鈕 ---//
            if((postType=="innerPost" && (response.asker_id==userId || role=="manager")) || (postType=="faq" && role=="manager")){
               // 刪除
                content += '<button type="button" class="scoreBtn" onclick="wantDeletePost()"><i class="fa fa-trash-o" aria-hidden="true"></i></button>';
            }
            document.getElementById("questionTitle").innerHTML = content;
            
            showQuestion(response);
            //----- 顯示問題 END -----//
            
            
            //----- 顯示答案 START -----//
            content = '<div class="title" style="display: inline-block">回答</div>';
            
            // --- 回覆按鈕 ---//
            if((postType=="innerPost" && (role=="facebook_user" || role=="google_user")) || (postType=="faq" && role=="manager")){
                content += '<button type="button" class="scoreBtn" onclick="setPage(';
                content += "'replyQuestionFrame'";
                content += ')"><i class="fa fa-plus" aria-hidden="true"></i></button>';
            }
            document.getElementById("answerTitle").innerHTML = content;
            console.log("回覆: ");
            console.log(response);
            showAnswers(response);
            //----- 顯示答案 END -----//
        },
        error: function(){
//            console.log("失敗: 拿單篇貼文（query_inner_post）");
        }
    });
}
///////////////  抓初始資料 END ///////////////

window.addEventListener("load", start, false);