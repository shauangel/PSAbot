var postType;
 
////////// 處理程式碼 START //////////
// 預覽內容
function showReplyContent(why){//why可以是see, save
    var userContent = $("#replyContent").val();
    console.log("userCOntetn: "+userContent);
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
//    console.log("addCodeArea");
    var language = $("select[name='codeLanguage']").val();
    var content = $("#replyContent").val();
//    console.log("原本的content: "+content);
    content += '```[';
    content += language;
    content += ']\n```';
    
    $("#replyContent").val(content);
//    setCodeColor();
}
////////// 處理程式碼 END //////////

function save(){
//    showReplyContent();
    switch(postType){
        case "faq":
            addFaqAnswer();
            break;
        case "innerPost":
            addInnerPostAnswer();
            break;
    }
}

function addFaqAnswer(){
    //--- 取得表單資料 START ---//
    var faqId = localStorage.getItem("singlePostId");
    var vote = $("#answerScore").val();
    var content = showReplyContent("save");
    var edit = $("#replyContent").val();
//    console.log("edit: "+edit);
//    console.log("content: "+content);
    if(vote=="" && content==""){
        document.getElementById("modalContent").innerHTML="請輸入回覆的分數 以及 回覆內容";
        $("#note").modal("show");
    }
    else if(vote==""){
        document.getElementById("modalContent").innerHTML="請輸入回覆的分數";
        $("#note").modal("show");
    }
    else if(content==""){
        document.getElementById("modalContent").innerHTML="請輸入回覆內容";
        $("#note").modal("show");
    }
    else{
        var data = {faq_id: faqId, vote: vote, edit: edit, content: content};
//        console.log("data: ");
//        console.log(data);
        //--- 取得表單資料 END ---//

        //--- 呼叫API START ---//
        var myURL = head_url+"insert_faq_answer";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
//                console.log("成功: 回覆Faq（insert_faq_answer）");
//                console.log(response);
                setPage('mySinglePostFrame');
            },
            error: function(response){
                window.alert("回覆FAQ 失敗！\n請再試一次");
            }
        });
        //--- 呼叫API START ---//
    }
}

function addInnerPostAnswer(){
    var myURL, data;
    var postId = localStorage.getItem("singlePostId");
    var postOwnerId;
    var replierId = localStorage.getItem("sessionID");
    var replierName = localStorage.getItem("userName");
    var response = showReplyContent("save");
    
    //true->匿名, false->不是匿名
    var anonymous = document.getElementById('anonymous').checked;
    
    // 時間
    var time = dateToString(new Date());
//    console.log("儲存時間: "+time);
    
    myURL = head_url + "query_inner_post";
    data = {_id: postId};
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log(response);
            postOwnerId = response.asker_id;
        },
        error: function(response){
//            console.log("error:");
//            console.log(response);
        }
    });
    
    // 回覆貼文的資料
    var response = showReplyContent("save");
    var edit = $("#replyContent").val();

    var data = {post_id: postId, replier_id: replierId, replier_name: replierName, response: response, edit: edit, time: time, incognito: anonymous};
    if(response=="" || edit==""){
       $("#note").modal('show');
    }
    else{
        //----- 為了處理通知 更新資料庫 -----//
        myURL = head_url + "add_post_notification?user_id="+postOwnerId+"&replier_id="+replierId+"&post_id="+postId;
        console.log("HTTP GET - add_post_notification的URL: "+myURL);
        $.ajax({
            url: myURL,
            type: "GET",
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                console.log("add_post_notification的回覆: ");
                console.log(response);
            },
            error: function(response){
                console.log(response);
//                window.alert("回覆貼文 失敗！\n請再試一次");
            }
        });

        //----- 回覆貼文 -----//
        myURL = head_url + "insert_inner_post_response";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                console.log(response);
                setPage('mySinglePostFrame');
            },
            error: function(response){
                console.log("失敗: 回覆貼文（insert_inner_post_response）");
                console.log(response);
                window.alert("回覆貼文 失敗！\n請再試一次");
            }
        });   
    }
}

function start(){
    postType = localStorage.getItem("postType");
    var content = "";
    switch(postType){
        case "faq":
            content += '<label class="col-sm-2 col-form-label">回覆的分數</label><input class="addFAQsInput col-sm-10" id="answerScore"><br>';
            break;
        case "innerPost":
            content += '<label class="col-sm-2 col-form-label">是否匿名<input id="anonymous" type="checkbox"  data-toggle="toggle" data-size="xs" data-onstyle="secondary" data-width="60" data-height="35" data-on="是" data-off="否"></label>';
            break;
    }
    document.getElementById("replyFirst").innerHTML = content;
}



window.addEventListener("load", function(){
    start();
}, false);