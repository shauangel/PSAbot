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

//// 用來記使用者選擇的所有標籤
var language = [];
var children = [];
var chosenTags = [];
// 以上3個都是放id
var allTags = {};

function start(){
    $("#tag_content").hide();
    
    //先去準備Tag的內容
    getLanguageTag();
    
//    var simplemde = new SimpleMDE({ 
//        element: document.getElementById("postContent") 
//    });
    
//    var editor = new Editor({
//        element: document.getElementById("postContent")
//    });
//
//    editor.render();
}

// 目前不需要
function show_choose_tag(){
    $("#tag_content").show();
    var content = "";
    content += '<i class="fa fa-angle-up" aria-hidden="true" style="float: right; color: gray;" onclick="hide_choose_tag()"></i>';
    document.getElementById("arrow").innerHTML = content;
}

// 目前不需要
function hide_choose_tag(){
    $("#tag_content").hide();
    console.log("toggle");
    var content = "";
    content += '<i class="fa fa-angle-down" aria-hidden="true" style="float: right; color: gray;" onclick="show_choose_tag()"></i>';
    document.getElementById("arrow").innerHTML = content;
}

//根據chosenTags的內容 顯示已選擇的tags
function showChosenTags(page){
    console.log("showChosenTags");
    var chosen_tag_content = "<hr>";
    
    for(var i=0; i<chosenTags.length; i++){
        chosen_tag_content += '<label class="badge purpleLabel" style="margin-right: 5px;">';
            chosen_tag_content += allTags[chosenTags[i]];
        chosen_tag_content += '<button type="button" class="labelXBtn" onclick="cancle(';
        chosen_tag_content += "'";
        chosen_tag_content += chosenTags[i];
        chosen_tag_content += "','";
        chosen_tag_content += page;
        chosen_tag_content += "'";
        chosen_tag_content += ')">x</button></label>';
    }

    document.getElementById("chosen_tag_in_modal").innerHTML = chosen_tag_content;
    // 外面的最下面 也要顯示已選擇的tags
    document.getElementById("chosen_tag").innerHTML = chosen_tag_content;
}

// 顯示可選擇的語言「子」標籤
function click_tag(id, page){
    // tag -> 是選擇了哪個tag
    // page -> 是選語言(0) 還是選孩子(1)
    var tag = allTags[id];
    
    
    // 已選擇的tag START
    
    // card的最下面顯示已選擇的tags
    if(!chosenTags.includes(id)){ //如果還沒選過
        console.log("顯示起來～");
        chosenTags.push(id);
        document.getElementById(id).setAttribute("style", "margin-right: 5px; background-color: #E6E6FA;");
        if(language.indexOf(id)==-1){
            showChosenTags(1);
            console.log("page1");
        }
        else{
            showChosenTags(0);
            console.log("page0");
        }
    }
    // 已選擇的tag END
    
    
    // 可以選擇的標籤 START
    if(page==0){
        
        var myURL = head_url+"query_all_offspring_tag?tag_id="+id;
        children = [];
            $.ajax({
                url: myURL,
                type: "GET",
                async: false, 
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                success: function(response){
                    console.log("success");
                    //先記下allTags 包含名字&ID
                    for(var i=0; i<response.tags.length; i++){
                        console.log("i: "+i);
                        
                        var temp = response.tags[i].tag_name;
                        temp = temp.replace("'", "&apos;");
                        
                        allTags[response.tags[i].tag_id] = temp;
                        children.push(response.tags[i].tag_id);
                    }
                },
                error: function(){
                    console.log("error");
                }
            });
        showChildrenAndSetColor();
    }
    // 可以選擇的標籤 END
}

function showChildrenAndSetColor(){
    localStorage.setItem("chooseTags", 1);
    // 標題 START
    // 需加上上一頁的按鈕
    var titleContent = "";
    titleContent += '<i class="fa fa-angle-left scoreBtn" aria-hidden="true" onclick="showLanguageTag()" style="color: gray; margin-right: 5px;"></i>';
    titleContent += "選擇相關標籤";
    
    document.getElementById("exampleModalLabel").innerHTML = titleContent;
    // 標題 END
    
    var content = "";
    for(var i=0; i<children.length; i++){
        content += '<label id="';
        content += children[i]; //這裡要放id
        content += '" class="badge purpleLabel2" style="margin-right: 5px;';
        if(chosenTags.indexOf(children[i])!=-1){
            content += 'background-color: #E6E6FA;';
        }
        content += '" onclick="click_tag(';
        content += "'";
        content += children[i];
        content += "', '1'";
        content += ')">';
            content += allTags[children[i]];
        content += "</label>";
    }
    
//    console.log("innerHTML: "+content);
    document.getElementById("chose_tag").innerHTML = content;
}
 
// 顯示可選擇的語言標籤
function getLanguageTag(){
    
    // 中間內容 START
    // 先去跟後端拿 只有顯示語言的標籤有哪些
    var myURL = head_url+"query_all_languages";
    $.ajax({
        url: myURL,
        type: "GET",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("success");
            //先記下allTags 包含名字&ID
            for(var i=0; i<response.tags.length; i++){
                language.push(response.tags[0]._id);
                allTags[response.tags[0]._id] = response.tags[0].tag;
                showLanguageTag();
            }
        },
        error: function(){
            console.log("error");
        }
    });
    // 中間內容 END
}

// 顯示「語言」tag的content
function showLanguageTag(){
    localStorage.setItem("chooseTags", 0);
    // 標題 START
    var titleContent = "";
    titleContent += "選擇相關標籤";
    
    document.getElementById("exampleModalLabel").innerHTML = titleContent;
    // 標題 END
    
    var content = "";
    for(var i=0; i<language.length; i++){
//        console.log("language.length: "+language.length);
//        console.log("language[i]: "+language[i]);
        content += '<label id="';
        content += language[i];
        content += '" class="badge purpleLabel2" style="margin-right: 5px;';
        //如果選過要變色
        if(chosenTags.indexOf(language[i])!=-1){
            content += 'background-color: #E6E6FA;';
        }
        content += '" onclick="click_tag(';
        content += "'";
        content += language[i];
        content += "', '0'"
        content += ')">';
            content += allTags[language[i]];
        content += '</label>';
    }

    document.getElementById("chose_tag").innerHTML = content;
}

// 取消選擇tag後的處理
function cancle(id, page){
    
    var index = chosenTags.indexOf(id);
    if(index != -1){
        chosenTags.splice(index,1);
        showChosenTags(page);
    }
    
    var temp = parseInt(localStorage.getItem("chooseTags"));
    console.log("page為: "+temp);
    if(temp==0 && language.indexOf(id)==-1){
        showChildrenAndSetColor();
        showLanguageTag();
        localStorage.setItem("chooseTags", 0);
    }
    else if(temp==0 && language.indexOf(id)!=-1){
        showLanguageTag();
    }
    else if(temp==1 && language.indexOf(id)==-1){
        showChildrenAndSetColor();
    }
    else{
        showLanguageTag();
        showChildrenAndSetColor();
        localStorage.setItem("chooseTags", 1);
    }
}


function save(){
    // id
    var id = localStorage.getItem("sessionID");
    // 姓名
    var myURL = head_url + "query_user_profile";
    var temp = {_id: id};
    var name = "";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(temp),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 拿姓名（query_user_profile）");
            name = response.name;
        },
        error: function(){
//            console.log("失敗: 拿姓名（query_user_profile）");
        }
    });
    
    // 標題
    var title = $("#postTitle").val();
    // 內容
//    var question = $("#postContent").val();
    var question = showReplyContent("save");
    var edit = $("#replyContent").val();
    // 標籤
    var tag = [];
    for(var i=0; i<chosenTags.length; i++){
        var temp = {"tag_id": chosenTags[i], "tag_name": allTags[chosenTags[i]]};
        tag.push(temp);
    }
    // 時間
    var time = new Date().toJSON();
    time = time.slice(0, 23);
    
    //true->匿名, false->不是匿名
    var anonymous = document.getElementById('anonymous').checked;
    
    var data = {asker_id: id, asker_name: name, title: title, question: question, edit: edit, tag: tag, time: time, incognito: anonymous};
    if(title.length==0){
        $("#warningContent").text('標題不得為空');
        $("#warning").modal('show');
    }
    else if(question.length==0){
        $("#warningContent").text('內容不得為空');
        $("#warning").modal('show');
    }
    else{
        console.log("傳出去的data資料");
        console.log(data);
        myURL = head_url + "insert_inner_post";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
                console.log("成功: 發布貼文（insert_inner_post）");
                console.log(response);
                setPage('profileFrame');
            },
            error: function(response){
                console.log("失敗: 發布貼文（insert_inner_post）");
                console.log(response);
                window.alert("發布貼文 失敗！\n請再試一次");
            }
        });
    }
}

window.addEventListener("load", start, false);