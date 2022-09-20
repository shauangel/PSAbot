var postType;

////////// 處理程式碼 START //////////
// 預覽內容
function showReplyContent(why){//why可以是see, save
    var userContent = $("#replyContent").val();
//    console.log("userCOntetn: "+userContent);
    var storeContent = ""; //要存起來的程式碼
    
    //dotNum 代表有連續幾個`
    //needCouple 是否需要後半段```
    //language 代表程式碼的語言
    var dotNum=0, needCouple=false, language="", middle=false, subString;
    for(var i=0; i<userContent.length; i++){
        if(userContent[i]=="`"){ //遇到`
            dotNum += 1;
            if(dotNum==3 && needCouple==false){ //湊滿3個 && 是第一次
                //去頭去尾換行 START
                middle = true;
                subString = "";
                //去頭去尾換行 END
                
                dotNum = 0;//需要清空`的數量
                
                //先去拿語言
                i += 1;//直接前往下一個index
                var flag = false;
                while(true){
                    if(userContent[i] ==']'){
                        break;
                    }
                    if(flag==true){
                        language += userContent[i];
                    }
                    if(userContent[i] == '['){
                        flag = true;
                    }
                    i += 1;
                }
                storeContent += '<pre><code class="';
                storeContent += language
                storeContent += '">';

                language = "";
                needCouple = true; //代表需要後半段
            }
            else if(dotNum==3 && needCouple==true){ //湊滿3個 && 是第二次
                dotNum = 0;//需要清空`的數量
                needCouple = false;
                
                subString = subString.trim();
                
                storeContent += subString;
                storeContent += "</code></pre>";
                middle = false;
            }
        }
        else if(middle){
            subString += userContent[i];
        }
        else{
            console.log("else");
            storeContent += userContent[i];
        }
    }
    
    console.log("preview的內容: ");
    console.log(storeContent);
    if(why=="see"){
        document.getElementById("previewContent").innerHTML = storeContent;
        hljs.highlightAll();
    }
    else if(why=="save"){
        return storeContent;
    }
    return "";
}

// 新增程式碼區塊
function addCodeArea(){
    console.log("addCodeArea");
    var language = $("select[name='codeLanguage']").val();
    var content = $("#replyContent").val();
    console.log("原本的content: "+content);
    content += '```[';
    content += language;
    content += ']\n```';
    
    $("#replyContent").val(content);
//    setCodeColor();
}
////////// 處理程式碼 END //////////

////////////// 拿回覆資料＆顯示 START //////////////
function showFaqAnswer(){
    document.getElementById("editReplyVote").innerHTML = '<label class="col-sm-2 col-form-label">回覆的分數</label><input class="addFAQsInput col-sm-10" id="answerScore"><br>';
    
    var myURL = head_url + "query_faq_post";
    var postId = localStorage.getItem("singlePostId");
    var data = {"_id": postId};
    var content = "";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            var replyId = localStorage.getItem("replyId");
            for(var i=0; i<response.answers.length; i++){
                if(response.answers[i].id == replyId){
                    $("#answerScore").val(response.answers[i].vote);
                    document.getElementById("replyContent").innerHTML = response.answers[i].edit;
                    break;
                }
            }
        },
        error: function(){
//            console.log("失敗: 拿單篇貼文（query_inner_post）");
        }
    });
}

function showInnerPostAnswer(){
    var myURL = head_url + "query_inner_post";
    var postId = localStorage.getItem("singlePostId");
    var data = {"_id": postId};
    var content = "";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            var replyId = localStorage.getItem("replyId");
            for(var i=0; i<response.answer.length; i++){
                if(response.answer[i]._id == replyId){
                    document.getElementById("replyContent").innerHTML = response.answer[i].edit;
                    document.getElementById("previewContent").innerHTML = response.answer[i].response;
                    hljs.highlightAll();
                    break;
                }
            }
        },
        error: function(){
//            console.log("失敗: 拿單篇貼文（query_inner_post）");
        }
    });
}

function start(){
    console.log("有載入editReply");
    postType = localStorage.getItem("postType");
    switch(postType){
        case "faq":
            showFaqAnswer();
            break;
        case "innerPost":
            showInnerPostAnswer();
            break;
    }
}
////////////// 拿回覆資料＆顯示 END //////////////



////////////// 編輯回覆 START //////////////
function editFaqAnswer(){
    var faqId = localStorage.getItem("singlePostId");
    var answerId = localStorage.getItem("replyId");
    var vote = $("#answerScore").val();
    var response = showReplyContent("save");
    var edit = $("#replyContent").val();
    if(vote=="" && response==""){
        document.getElementById("modalContent").innerHTML = "請輸入回覆的分數 以及 回覆內容";
        $("#note").modal("show");
    }
    else if(vote==""){
        document.getElementById("modalContent").innerHTML = "請輸入回覆的分數";
        $("#note").modal("show");
    }
    else if(response==""){
        document.getElementById("modalContent").innerHTML = "回覆內容";
        $("#note").modal("show");
    }
    else{
        var data = {faq_id: faqId, answer_id: answerId, vote: vote, edit: edit, content: response};
        console.log("data: ");
        console.log(data);
        myURL = head_url + "update_faq_answer";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                localStorage.removeItem("replyId");
    //            console.log("成功: 編輯回覆（update_inner_post_response）");
                console.log(response);
                setPage('mySinglePostFrame');
            },
            error: function(response){
    //            console.log("失敗: 編輯回覆（update_inner_post_response）");
    //            console.log(response);
                window.alert("編輯回覆 失敗！\n請再試一次");
            }
        });
    }
}

function editInnerPostAnswer(){
    var response = $("#response").val();
    
    if(response == ""){
        document.getElementById("modalContent").innerHTML = "請輸入回覆內容";
        $("#note").modal("show");
    }
    else{
        var postId = localStorage.getItem("singlePostId");
        var replyId = localStorage.getItem("replyId");
        var replierId = localStorage.getItem("sessionID");
        var replierName = localStorage.getItem("userName");
        // 時間
        var time = new Date().toJSON();
        time = time.slice(0, 23);
        var response = showReplyContent("save");
        var edit = $("#replyContent").val();

        var data = {_id: replyId, post_id: postId, replier_id: replierId, replier_name: replierName, response: response, edit: edit, time: time};
    //    console.log("傳出去的data資料");
    //    console.log(data);
        myURL = head_url + "update_inner_post_response";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
    //            console.log("成功: 編輯回覆（update_inner_post_response）");
                setPage('mySinglePostFrame');
            },
            error: function(response){
    //            console.log("失敗: 編輯回覆（update_inner_post_response）");
    //            console.log(response);
                window.alert("編輯回覆 失敗！\n請再試一次");
            }
        });
    }
}

function edit(){
    switch(postType){
        case "faq":
            editFaqAnswer();
            break;
        case "innerPost":
            editInnerPostAnswer();
            break;
    }
}
////////////// 編輯回覆 END //////////////

window.addEventListener("load", start, false);