////////// 處理程式碼 START //////////
// 預覽內容
function showReplyContent(why, textId, viewId){//why可以是see, save
    var userContent = $("#"+textId).val();
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
                    if(userContent[i] ==']') break;
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
    if(why=="see"){
        document.getElementById(viewId).innerHTML = storeContent;
        hljs.highlightAll();
    }
    else if(why=="save"){
        return storeContent;
    }
    return "";
}

// 新增程式碼區塊
function addCodeArea(textId, selectName){//加在textId的區塊裡
//    console.log("addCodeArea");
    var language = $("select[name='"+selectName+"']").val();
    var content = $("#"+textId).val();
//    console.log("原本的content: "+content);
    content += '```[';
    content += language;
    content += ']\n```';
    
    $("#"+textId).val(content);
//    setCodeColor();
}
////////// 處理程式碼 END //////////

var answerNum = 0;

///////////////// 手動新增 START /////////////////

// 回覆 START
function addFAQsData(){
    // 初始化 START
    answerNum = 0;
    document.getElementById("addFAQAnswerContent").innerHTML = "";
    language_for_add = [];
    children_for_add = [];
    chosenTags_for_add = [];
    allTags_for_add = {};
    whoUseTags = "addFaq";
    getLanguageTag();
    // 初始化 END
    $('#newFAQsData').modal('show');
}

function addFAQAnswerNum(){
    var addFAQAnswerContent = document.getElementById("addFAQAnswerContent");
    
    var newAnswerDiv = document.createElement('div');
    newAnswerDiv.id = answerNum;
    
    var content = "";
    content += '<br>';
    content += '回覆的分數：<input id="FAQAnswerScore';
    content += answerNum;
    content += '" class="addFAQsInput"><br>';
    content += '回覆的內容：<br>';
    
    content += '<select name="FAQAnswerCode';
    content += answerNum;
    content += '">';
        content += '<option value="python" selected>python</option>';
        content += '<option value="html">HTML</option>';
        content += '<option value="css">CSS</option>';
        content += '<option value="javascript">Javascript</option>';
        content += '<option value="C">C</option>';
    content += '</select>';

    content += '<div class="themeButton" style="display: inline-block; padding: 3px;" onclick="addCodeArea(\'FAQAnswerText';
    content += answerNum;
    content += '\', \'FAQAnswerCode';
    content += answerNum;
    content += '\')">';
        content += '新增程式碼區塊';
    content += '</div>';
    
    content += '<div class="themeButton" style="display: inline-block; padding: 3px;" onclick="showReplyContent(\'see\', \'FAQAnswerText';
    content += answerNum;
    content += '\', \'FAQAnswerView';
    content += answerNum;
    content += '\')">';
        content += '預覽';
    content += '</div>';
    

    content += '<textarea id="FAQAnswerText';
    content += answerNum;
    content += '" rows="5" cols="5" class="form-control" placeholder="輸入回覆內容"></textarea>'

    content += '<div id="FAQAnswerView';
    content += answerNum;
    content += '" style="border: 0.1mm solid; border-color: #545048;">';
        content += '<br>預覽區塊<br><br>';
    content += '</div>';

    content += '<button class="grayButton" onclick="deleteFAQsAnswerInAdd(\'';
    content += answerNum;
    content += '\')">刪除此則回覆</button>';
    content += '<br>';
    
    addFAQAnswerContent.appendChild(newAnswerDiv);
    document.getElementById(answerNum).innerHTML = content;
    answerNum += 1;
}

function deleteFAQsAnswerInAdd(answerId){
    var obj = document.getElementById(answerId);
    obj.innerHTML = "";
    var parentObj = obj.parentNode;//获取ul的父对象
    parentObj.removeChild(obj);//通过ul的父对象把它删除
}
// 回覆 END
//-----------------------
///////////////// 透過標籤篩選 START /////////////////
var whoUseTags;//searchFaq, addFaq
// 用來記使用者選擇的所有標籤(搜尋用)
var language = [];
var children = [];
var chosenTags = [];
// 以上3個都是放id
var allTags = {};

// 用來記使用者選擇的所有標籤(新增用)
var language_for_add = [];
var children_for_add = [];
var chosenTags_for_add = [];
// 以上3個都是放id
var allTags_for_add = {};

//根據chosenTags的內容 顯示已選擇的tags
function showChosenTags(page){
    var chosen_tag_content = "<hr>";
    var outer_content = "<br>";
    
    var chosenTags_temp, allTags_temp;
    switch(whoUseTags){
        case "addFaq":
            chosenTags_temp = chosenTags_for_add;
            allTags_temp = allTags_for_add;
            break;
        case "searchFaq":
            chosenTags_temp = chosenTags;
            allTags_temp = allTags;
            break;
    }
    
    for(var i=0; i<chosenTags_temp.length; i++){
        chosen_tag_content += '<label class="badge purpleLabel" style="margin-right: 5px;">';
            chosen_tag_content += allTags_temp[chosenTags_temp[i]];
        chosen_tag_content += '<button type="button" class="labelXBtn" onclick="cancle(';
        chosen_tag_content += "'";
        chosen_tag_content += chosenTags_temp[i];
        chosen_tag_content += "','";
        chosen_tag_content += page;
        chosen_tag_content += "'";
        chosen_tag_content += ')">x</button></label>';
        
        outer_content += '<label class="badge purpleLabel" style="margin-right: 5px;">';
            outer_content += allTags_temp[chosenTags_temp[i]];
        outer_content += '</label>';
    }

    switch(whoUseTags){
        case "addFaq":
            document.getElementById("chosen_tag_in_modal_for_search").innerHTML = chosen_tag_content;
            break;
        case "searchFaq":
            document.getElementById("chosenTagInModalForSearch").innerHTML = chosen_tag_content;
    
            // 外面的最下面 也要顯示已選擇的tags
            document.getElementById("chosenTags").innerHTML = outer_content;
            break;
    }
}

// 顯示可選擇的語言「子」標籤
function click_tag(id, page){
    // tag -> 是選擇了哪個tag
    // page -> 是選語言(0) 還是選孩子(1)
    
    switch(whoUseTags){
        case "addFaq":
            // 已選擇的tag START
            // card的最下面顯示已選擇的tags
            if(!chosenTags_for_add.includes(id)){ //如果還沒選過
                chosenTags_for_add.push(id);
                document.getElementById(id).setAttribute("style", "margin-right: 5px; background-color: #E6E6FA;");
                if(language_for_add.indexOf(id)==-1){
                    showChosenTags(1);
                }
                else{
                    showChosenTags(0);
                }
            }
            // 已選擇的tag END
            break;
        case "searchFaq":
            // 已選擇的tag START
            // card的最下面顯示已選擇的tags
            if(!chosenTags.includes(id)){ //如果還沒選過
                chosenTags.push(id);
                document.getElementById(id).setAttribute("style", "margin-right: 5px; background-color: #E6E6FA;");
                if(language.indexOf(id)==-1){
                    showChosenTags(1);
                }
                else{
                    showChosenTags(0);
                }
            }
            // 已選擇的tag END
            break;
    }
    
    
    // 可以選擇的標籤 START
    if(page==0){
        if(whoUseTags=="addFaq"){
            id = id.slice(0, -8);
        }
        var myURL = head_url+"query_all_offspring_tag?tag_id="+id;
        switch(whoUseTags){
            case "addFaq":
                children_for_add = [];
                break;
            case "searchFaq":
                children = [];
                break;
        }
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

                    var temp = response.tags[i].tag_name;
                    temp = temp.replace("'", "&apos;");

                    switch(whoUseTags){
                        case "addFaq":
                            var t = response.tags[i].tag_id + "_for_add";
                            allTags_for_add[t] = temp;
                            children_for_add.push(t);
                            break;
                        case "searchFaq":
                            allTags[response.tags[i].tag_id] = temp;
                            children.push(response.tags[i].tag_id);
                            break;
                    }
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
    // 標題 START
    // 需加上上一頁的按鈕
    var titleContent = "";
    titleContent += '<i class="fa fa-angle-left scoreBtn" aria-hidden="true" onclick="showLanguageTag()" style="color: gray; margin-right: 5px;">上一頁</i>';
    
    var children_temp, chosenTags_temp, allTags_temp;
    switch(whoUseTags){
        case "addFaq":
            localStorage.setItem("chooseTags_for_add", 1);
            document.getElementById("forward_page_in_modal").innerHTML = titleContent;
            children_temp = children_for_add;
            chosenTags_temp = chosenTags_for_add;
            allTags_temp = allTags_for_add;
            break;
        case "searchFaq":
            localStorage.setItem("chooseTags", 1);
            document.getElementById("forwardPageInModal").innerHTML = titleContent;
            children_temp = children;
            chosenTags_temp = chosenTags;
            allTags_temp = allTags;
            break;
    }
    // 標題 END
    var content = "";
    for(var i=0; i<children_temp.length; i++){
        content += '<label id="';
        content += children_temp[i]; //這裡要放id
        content += '" class="badge purpleLabel2" style="margin-right: 5px;';
        if(chosenTags_temp.indexOf(children_temp[i])!=-1){
            content += 'background-color: #E6E6FA;';
        }
        content += '" onclick="click_tag(';
        content += "'";
        content += children_temp[i];
//        if(whoUseTags=="addFaq"){
//            content += "_for_add";
//        }
        content += "', '1'";
        content += ')">';
            content += allTags_temp[children_temp[i]];
        content += "</label>";
    }
    
    switch(whoUseTags){
        case "addFaq":
            document.getElementById("chose_tag_for_search").innerHTML = content;
            break;
        case "searchFaq":
            document.getElementById("choseTagForSearch").innerHTML = content;
            break;
    }
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
            //先記下allTags 包含名字&ID
            for(var i=0; i<response.tags.length; i++){
                if(whoUseTags=="addFaq"){
                    var t = response.tags[0]._id + "_for_add";
                    language_for_add.push(t);
                    allTags_for_add[t] = response.tags[0].tag;
                }
                else if(whoUseTags=="searchFaq"){
                    language.push(response.tags[0]._id);
                    allTags[response.tags[0]._id] = response.tags[0].tag;
                }
                showLanguageTag();
            }
        },
        error: function(){
//            console.log("error");
        }
    });
    // 中間內容 END
}

// 顯示「語言」tag的content
function showLanguageTag(){
    
    // 因為不需要改變陣列裡的值，所以這樣寫比較方便
    var language_temp, chosenTags_temp, allTags_temp;
    switch(whoUseTags){
        case "addFaq":
            document.getElementById("forward_page_in_modal").innerHTML = "";// 不要顯示上一頁
            localStorage.setItem("chooseTags_for_add", 0);
            language_temp = language_for_add;
            chosenTags_temp = chosenTags_for_add;
            allTags_temp = allTags_for_add;
            break;
        case "searchFaq":
            document.getElementById("forwardPageInModal").innerHTML = "";// 不要顯示上一頁
            localStorage.setItem("chooseTags", 0);
            language_temp = language;
            chosenTags_temp = chosenTags;
            allTags_temp = allTags;
            
            break;
    }
    
    var content = "";
    for(var i=0; i<language_temp.length; i++){
        content += '<label id="';
        content += language_temp[i];
        content += '" class="badge purpleLabel2" style="margin-right: 5px;';
        //如果選過要變色
        if(chosenTags_temp.indexOf(language_temp[i])!=-1){
            content += 'background-color: #E6E6FA;';
        }
        content += '" onclick="click_tag(';
        content += "'";
        content += language_temp[i];
        content += "', '0'"
        content += ')">';
            content += allTags_temp[language_temp[i]];
        content += '</label>';
    }
    switch(whoUseTags){
        case "addFaq":
            document.getElementById("chose_tag_for_search").innerHTML = content;
            break;
        case "searchFaq":
            document.getElementById("choseTagForSearch").innerHTML = content;
            break;
    }
    
}

// 取消選擇tag後的處理
function cancle(id, page){
    console.log("取消的id: "+id);
    
    var index;
    var language_temp, tempLocalStorageKey;// 因為下面只需要讀取，所以這樣寫比較方便
    switch(whoUseTags){
        case "addFaq":
            console.log("取消的tagName: "+allTags_for_add[id]);
            language_temp = language_for_add;
            index = chosenTags_for_add.indexOf(id);
            if(index != -1){
                chosenTags_for_add.splice(index,1);
                showChosenTags(page);
            }
            tempLocalStorageKey = "chooseTags_for_add";
            break;
        case "searchFaq":
            language_temp = language;
            index = chosenTags.indexOf(id);
            if(index != -1){
                chosenTags.splice(index,1);
                showChosenTags(page);
            }
            tempLocalStorageKey = "chooseTags";
            break;
    }
    
    var temp = parseInt(localStorage.getItem(tempLocalStorageKey));
    
    if(temp==0 && language.indexOf(id)==-1){
        showChildrenAndSetColor();
        showLanguageTag();
        localStorage.setItem(tempLocalStorageKey, 0);
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
        localStorage.setItem(tempLocalStorageKey, 1);
    }
}
///////////////// 透過標籤篩選 END /////////////////
//-----------------------

function saveFAQByHand(){
    var dataURL = $("#dataURL").val();
    $("#dataURL").val("");
    var FAQScore = $("#FAQScore").val();
    $("#FAQScore").val("");
    var FAQTitle = $("#FAQTitle").val();
    $("#FAQTitle").val("");
    
    var FAQQuestionContent = showReplyContent("save", "FAQQuestionText", "FAQQuestionView");
    var FAQQuestionEdit = $("#FAQQuestionText").val();
    
    var FAQAnswers = [];
    var answerChildren = $("#addFAQAnswerContent").children();
    for(var i=0; i<answerChildren.length; i++){
        var vote = $("#FAQAnswerScore"+answerChildren[i].id).val();
        
        var textIdTemp="FAQAnswerText"+answerChildren[i].id, viewIdTemp="FAQAnswerView"+answerChildren[i].id;
        var content = showReplyContent("save", textIdTemp, viewIdTemp);
        var edit = $("#FAQAnswerText"+i).val();
        FAQAnswers.push({vote: vote, content: content, edit: edit});
    }
    
    var tag = [];
    for(var i=0; i<chosenTags_for_add.length; i++){
        var temp = {"tag_id": chosenTags_for_add[i], "tag_name": allTags_for_add[chosenTags_for_add[i]]};
        tag.push(temp);
    }
    
    var time = new Date().toJSON();
    time = time.slice(0, 23);
    
//    var data = {link: dataURL, question: {title: FAQTitle, content: FAQContent}, answers: FAQAnswers, time: time};
    if(dataURL!="" && FAQTitle!="" && FAQQuestionContent!=""){
        if(FAQScore==""){
            FAQScore="0";
        }
        var data = {link: dataURL, question: {title: FAQTitle, content: FAQQuestionContent, edit: FAQQuestionEdit, vote: FAQScore}, answers: FAQAnswers, tags: tag, time: time};
        console.log("傳出去的Data: ");
        console.log(data);

        var myURL = head_url + "insert_faq_post";
        $.ajax({
            url: myURL,
            type: "POST",
            data: JSON.stringify(data),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function(response){
    //            console.log("成功: 新增貼文（insert_faq_post）");
                console.log(response);
                faqPageNumberAll = 1;
                faqOption = "time";
                searchFaqPost();
                searchAll("new");
            },
            error: function(response){
    //            console.log("失敗: 編輯貼文（insert_faq_post）");
    //            console.log(response);
            }
        });   
    }
    else{
        window.alert("請填寫好資料");
    }
    
}

///////////////// 手動新增 END /////////////////

///////////////// 匯入檔案 START /////////////////

// 匯入檔案（完整FAQ） START
function importFAQsData(){
    $('#importFAQsData').modal('show');
    $("#code").removeClass();
    $("#code").addClass("json");
}

// 拿到檔案並傳送給後端
function saveFaqAuto(){
    
//    var myURL = head_url + "import_faq_post";
//    //方法1
//    var fileInput = $('#importFile').get(0).files[0];
//	console.info(fileInput);
    
    // 方法2
//    var formData = new FormData();
//    formData.append('faq', document.getElementById("importForm").files[0]);
//    formData.get('file'); // 取得目前的檔案
    
//    $.ajax({
//        url: myURL,
//        type: 'POST',
//        data: formData,
//        contentType: false,
//        processData: false,
//        success: function(response) {
//            if(response.message=="error"){
//                window.alert("匯入失敗～");
//                console.log("匯入失敗");
//            }
//            else{
//                console.log("匯入成功");
//            }
//        },
//    });
    let form = new FormData();
    if(document.getElementById("importFile").files[0] != null){
        form.append("faq", document.getElementById("importFile").files[0]);
        form.get("file");
        
        var myURL = head_url + "import_faq_post";

        fetch(myURL, {
            method: 'POST',
            body: form,
            async: false, 
        }).then(res => {
            return res.json();   // 使用 json() 可以得到 json 物件
        }).then(result => {
            console.log(result); // 得到 {name: "oxxo", age: 18, text: "你的名字是 oxxo，年紀 18 歲～"}
        });
    }
}
// 匯入檔案（完整FAQ） END

///////////////// 匯入檔案 END /////////////////

///////////////// 搜尋的處理 START /////////////////
var faqPageNumberAll = 1;
var faqPageNumberString = 1;
var faqPageNumberTag = 1;
var faqOption = "score";
var faqSum;
var whichSearchType = "all";

function setLocalStorage(id){
    localStorage.setItem("singlePostId", id);
    setPage('mySinglePostFrame');
}

//---------- 頁數按鈕的處理 START ----------//
function disabledButton(id){
    document.getElementById(id).disabled = true;
    document.getElementById(id).classList.add("disabledButton");
}

function abledButton(id){
    document.getElementById(id).disabled = false;
    document.getElementById(id).classList.remove("disabledButton");
}

function editPageNum(sum){
    var begin = 1, end = Math.ceil((faqSum/5));
    
    var method = localStorage.getItem("method");
    var temp;
    sum = parseInt(sum);
    
    switch(whichSearchType){
        case "all":
            temp = faqPageNumberAll+sum;
            faqPageNumberAll = temp;
            searchAll("old");
            break;
        case "text":
            temp = faqPageNumberString+sum;
            faqPageNumberString = temp;
            searchText("old");
            break;
        case "tags":
            temp = faqPageNumberTag+sum;
            faqPageNumberTag = temp;
            searchTag("old");
            break;
    }
    if(temp == begin){
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    if(temp == end){
        disabledButton("forwardPage");
    }
    else{
        abledButton("forwardPage");
    }
}
//---------- 頁數按鈕的處理 END ----------//

// 顯示貼文
function showFaq(faqList){
    console.log("顯示FAQ:");
    console.log(faqList);
    // 處理上下頁Button START
    if(faqSum<=5){
        disabledButton("forwardPage");
    }
    else{
        abledButton("forwardPage");
    }
    // 處理上下頁Button END
    
    var role = localStorage.getItem("role");
    var content = "";
    if(faqList.length==0){
        content = '<div class="title">目前沒有符合的FAQ</div>';
    }
    for(var i=0; i<faqList.length; i++){
        var id = faqList[i]._id;
        var title = faqList[i].question.title;
        var tags = faqList[i].tags;
        var time = new Date(faqList[i].time);
        time = time.toISOString();
        time = time.slice(0, 10);
        var score = faqList[i].score;
        var vote = faqList[i].question.vote;

        content += '<div class="col-lg-4 col-xl-3 col-sm-12">';
        content += '<a href="#" onclick="setLocalStorage(';
        content += "'";
        content += id;
        content += "')";
        content += '">';

            content += '<div class="badge-box">';
                content += '<div class="sub-title">';
                    content += '<span> FAQ的ID #';
                    content += id;
                    content += '</span>';
                    
                    // score START
                    content += '<span style="float:right;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="此網站的分數"></i>';
                    content += score;
                    content += '</span>';
                    // score END

                // vote（管理者輸入的分數） START
                    content += '<span style="float:right; margin-left: 4px;"><i class="fa fa-trophy" aria-hidden="true" data-toggle="tooltip" data-placement="top" data-original-title="外面網站的分數"></i>';
                    content += vote;
                    content += '</span>';
                // vote（管理者輸入的分數） END
        
                content += '</div>';

                content += '<div>';
                    content += title;
                content += '</div>';

                content += '<div style="margin-top: 20px;">';
                    for(var j=0; j<tags.length; j++){
                        content += '<label class="badge badge-default purpleLabel">';
                            content += tags[j].tag_name;
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
    document.getElementById("faq").innerHTML = content;
}

//---------- 篩選貼文方式 START -----------//
//// 篩選時的一些處理
//function filter(){
//    language = [];
//    children = [];
//    chosenTags = [];
//    allTags = {};
//    whoUseTags = "searchFaq";
//    getLanguageTag();
//    $("#aboutSearch").modal("show");
//
//    document.getElementById("searchAll").addEventListener("click", showSearchAll, false);
//    document.getElementById("searchText").addEventListener("click", showSearchTextInput, false);
//    document.getElementById("searchTag").addEventListener("click", showSearchTagInput, false);
//    
//    document.getElementById("chose_tag").innerHTML = "";
//    document.getElementById("chosen_tag_in_modal").innerHTML = "";
//}
//
//// 隱藏打字＆選標籤的地方
//function showSearchAll(){
//    if($('input:radio[name="searchType"]:checked').val()=="searchAll"){
//        $("#searchTextContent").hide(); // 隱藏別人的
//        $("#searchTagContent").hide(); // 隱藏別人的
//    }
//}
//
//// 顯示打字的地方
//function showSearchTextInput(){
////    console.log("值: "+$('input:radio[name="searchType"]:checked').val());
//    if($('input:radio[name="searchType"]:checked').val()=="searchText"){
//        $("#searchTextContent").show(); // 顯示自己的
//        $("#searchTagContent").hide(); // 隱藏別人的
//    }
//}
//
//// 顯示選擇tag的地方
//function showSearchTagInput(){
//    if($('input:radio[name="searchType"]:checked').val()=="searchTag"){
//        $("#searchTagContent").show(); // 顯示自己的
//        $("#searchTextContent").hide(); // 隱藏別人的
//    }
//}
//---------- 篩選貼文方式 END ----------//

//---------- 貼文排序方式 START ----------//
function showPostSort(){
    $("#aboutPost").modal('show');
}

function changePostSort(){
    //排序條件 | 依分數排序
    var sortType = $('input:radio[name="sortType"]:checked').val();
    if(sortType==undefined){
        sortType = "score";
    }
    switch(sortType){
        case "sortScore":
            faqOption = "score";
            document.getElementById("optionText").innerHTML = "排序條件 | 依分數排序";
            break;
        case "sortView":
            faqOption = "view_count";
            document.getElementById("optionText").innerHTML = "排序條件 | 依觀看次數排序";
            break;
        case "sortDate":
            faqOption = "time";
            document.getElementById("optionText").innerHTML = "排序條件 | 依時間排序";
            break;
    }
    switch(whichSearchType){
        case "all":
            searchAll("new");
            break;
        case "text":
            searchText("new");
            break;
        case "tag":
            searchTag("new");
            break;
    }
}
//---------- 貼文排序方式 END ----------//

//---------- 搜尋方法 START ----------//
// 顯示全部的FAQ
function searchAll(which){
    whichSearchType = "all";
    if(which == "new"){
        pageNumber = 1;
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    var myURL = head_url + "query_faq_list";
    
    var data = {page_size: 5, page_number: faqPageNumberAll, option: faqOption};
    console.log(data);
    var content = "";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 拿所有FAQs（query_faq_list）");
            console.log(response);
            faqSum = response.faq_count;
            showFaq(response.faq_list);
        },
        error: function(){
//            console.log("失敗: 拿所有FAQs（query_faq_list）");
        }
    });
}

// 透過字串搜尋
function showSearchBar(){
    $("#searchBar").modal("show");
}
function searchText(which){
    clearTags();
    
    whichSearchType = "text";
    if(which == "new"){
        faqPageNumberString = 1;
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    var text = $("#searchTextContent2").val();
    
    var data = {search_string: text, page_size: 5, page_number: faqPageNumberString, option: faqOption};

    var myURL = head_url + "query_faq_list_by_string";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 透過字搜尋faq（query_faq_list_by_string）");
//            console.log(response);
            faqSum = response.faq_count;
            showFaq(response.faq_list);
        },
        error: function(response){
//            console.log("失敗: 透過字搜尋faq（query_faq_list_by_string）");
//            console.log(response);
        }
    });
}

// 透過TAG搜尋FAQ
function showSearchTag(){
    whoUseTags = "searchFaq";
    $("#aboutTag").modal('show');
}
function searchTag(which){
    whichSearchType = "tag";
    if(which == "new"){
        faqPageNumberTag = 1;
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    var sendTags=[];
    for(var i=0; i<chosenTags.length; i++){
        var temp = {tag_id: chosenTags[i], tag_name: allTags[chosenTags[i]]};
        sendTags.push(temp);
    }
    
    var data = {tag: sendTags, page_size: 5, page_number: faqPageNumberTag, option: faqOption};
//    console.log(data);
    
    var myURL = head_url + "query_faq_list_by_tag";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 透過tag搜尋FAQ（query_faq_list_by_tag）");
//            console.log(response);
            faqSum = response.faq_count;
            showFaq(response.faq_list);
        },
        error: function(response){
//            console.log("失敗: 透過tag搜尋FAQ（query_faq_list_by_tag）");
//            console.log(response);
        }
    });
}
//----------- 搜尋方法 START ----------//

// 開始搜尋 呼叫各自的API＆顯示的東西
function searchFaqPost(){
    var searchType = $('input:radio[name="searchType"]:checked').val();
    var sortType = $('input:radio[name="sortType"]:checked').val();
    var content = "篩選條件", contentSearch, contentSort;
    
    switch(sortType){
        case "sortScore":
            faqOption = "score";
            contentSort = " | 依分數排序";
            break;
        case "sortView":
            faqOption = "view_count";
            contentSort = " | 依觀看次數排序";
            break;
        case "sortDate":
            faqOption = "time";
            contentSort = " | 依日期排序";
            break;
    }
    
//    switch(searchType){
//        case "searchAll":
//            searchAll("new");
//            contentSearch = " | 顯示全部";
//            break;
//        case "searchText":
//            searchText("new");
//            contentSearch = " | 相關的字";
//            break;
//        case "searchTag":
//            searchTag("new");
//            contentSearch = " | 相關標籤";
//            break;
//    }
    
    document.getElementById("optionText").innerHTML = content+contentSort;
}
///////////////// 搜尋的處理 END /////////////////
function set(){
    localStorage.setItem("postAPI", "query_faq_list");
    localStorage.setItem("postType", "faq");
    
    if(localStorage.getItem("role")=="manager"){
        document.getElementById("newFaqData").innerHTML = '<button class="themeButton" onclick="addFAQsData()">新增</button><button class="themeButton" onclick="importFAQsData()">匯入</button>';
    }
    

//    var searchButton = document.getElementById("searchText");
//    searchButton.addEventListener('keydown', function(e){
//      // enter 的 keyCode 是 13
//      if( e.keyCode === 13 ){
//          searchText("new");
//      }
//    }, false);
}

function clearTags(){
    document.getElementById("chosenTags").innerHTML = "";
    document.getElementById("chosenTagInModalForSearch").innerHTML = "";
    language = [];
    children = [];
    chosenTags = [];
    allTags = {};
    getLanguageTag();
}

window.addEventListener("load", function(){
    set();
    searchAll("new");
    
    // 假設一開始是
    whoUseTags = "searchFaq";
    getLanguageTag();
    
    //幫searchBar註冊enter press事件 START
    var input = document.getElementById("searchTextContent2");
    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            console.log("press enter");
            $('#searchBar').modal('hide');
            searchText("new");
        }
    });
    //註冊完畢 END
    
}, false);