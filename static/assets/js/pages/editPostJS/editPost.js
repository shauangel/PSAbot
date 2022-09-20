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


//_id, title, question, keyword, tag, time, incognito
var userId, postId, title, question, tag, time, incognito;//內部貼文用
var data;//FAQ用
var questionTitle, questionContent;
var isDiscussion = false;

//var forwardPage = localStorage.getItem("forwardPage");//manageFAQsFram
var postType = localStorage.getItem("postType");

////////////// 拿貼文資料＆顯示 START //////////////
function start(){
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
    var postId = localStorage.getItem("singlePostId");
    data = {"_id": postId};
    var content = "";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            if(postType=="faq"){
                data = response;
                delete data["keywords"];
                delete data["view_count"];
                questionTitle = data.question.title;
                questionContent = data.question.edit;
            }
            else{
                keyword = response.keyword;
                tag = response.tag;
                incognito = response.incognito;
                
                questionTitle = response.title;
                if(response.is_discuss){ // 共同討論
                    isDiscussion = true;
                    questionContent = addCheckboxToHistory(response.room_id, response.edit);
                }
                else{
                    questionContent = response.edit;
                }
            }
            
            document.getElementById("title").setAttribute("value", questionTitle);
            if(response.is_discuss){ // 共同討論
                document.getElementById("postContent").innerHTML = questionContent;
            }
            else{
                document.getElementById("replyContent").innerHTML = questionContent;
            }
        },
        error: function(){
        }
    });
}

function addCheckboxToHistory(roomId, indexVal){
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
    console.log("data: ");
    console.log(data);
    for(var i=0; i<data.length; i++){
        // 先去處理照片的部分 START
        var temp = userIds.indexOf(data[i].user_id);
        if(temp == -1){ //代表還沒拿到照片
            userImgs[userImgs.length] = getChatroomUserImg(data[i].user_id);
            img = userImgs[userImgs.length-1];
        }
        else{
            img = userImgs[temp];
        }
        // 先去處理照片的部分 END
        
        if(data[i].user_id == userId){ //代表是自己說話
            
            // 加上checkbox START
            content += '<div class="mb-4">';
            content += '<label>';
            content += '<input type="checkbox" name="chatHistory" value="';
            content += i;
            content += '"';
            console.log("有選？ "+indexVal.includes(i.toString()));
            if(indexVal.includes(i.toString())){
                content += 'checked';
            }
            content += '>';
            content += '</label>';
            content += '<div class="img_cont_msg" style="float: right;">';
            content += '<img src="';
            content += img;
            content += '" class="chatImg">';
            content += '</div>';
            content += '<div class="msg_cotainer_send" style="float: right;">';
            content += data[i].content;
            content += '</div>';
            content += '</div>';
            // 加上checkbox END
        }
        else{
            // 加上checkbox START
            content += '<div class="d-flex justify-content-start mb-4">';
            content += '<label>';
            content += '<input type="checkbox" name="chatHistory" value="';
            content += i;
            content += '"';
            console.log("有選？ "+indexVal.includes(i.toString()));
            if(indexVal.includes(i.toString())){
                content += 'checked';
            }
            content += '>';
            content += '</label>';
            content += '<div class="img_cont_msg">';
            content += '<img src="';
            content += img;
            content += '" class="chatImg" style="background-color: #5D478B;">';
            content += '</div>';
            content += '<div class="msg_cotainer">';
            content += data[i].content;
            content += '</div>';
            content += '</div>';
            // 加上checkbox END
        }
    }
    return content;
}
////////////// 拿貼文資料＆顯示 END //////////////


////////////// 儲存貼文 START //////////////
function save(){
    var edit;
    console.log("儲存前faq: ");
    console.log(data);
    postId = localStorage.getItem("singlePostId");
    userId = localStorage.getItem("sessionID");
    title = $("#title").val();
    
    if(isDiscussion){
        var indexVal = new Array();
        $('input[name="chatHistory"]:checkbox:checked').each(function(i) {
            indexVal[i] = this.value;
        });
        question = indexVal;
        edit = indexVal;
    }
    else{
        question = showReplyContent("save");
        edit = $("#replyContent").val();
    }
    // 時間
    time = new Date().toJSON();
    time = time.slice(0, 23);
    
    var myURL, afterURL;
    switch(postType){
        case "faq":
            afterURL = "update_faq_post";
            var time = new Date().toJSON();
            time = time.slice(0, 23);
            data["time"] = time;
            data["question"].title = title;
            data["question"].content = question;
            data["question"].edit = edit;
            break;
        case "innerPost":
            afterURL = "update_inner_post";
            data = {asker_id: userId, _id: postId, title: title, question: question, edit: edit, time: time};
            break;
    }
    console.log("傳出去的");
    console.log(data);
    
    myURL = head_url + afterURL;
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
            setPage('mySinglePostFrame');
        },
        error: function(response){
            window.alert("編輯失敗！\n請再試一次");
        }
    });
}
////////////// 儲存貼文 END //////////////

window.addEventListener("load", start, false);