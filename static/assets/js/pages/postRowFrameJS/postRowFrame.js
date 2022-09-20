function setLocalStorage(id){
    localStorage.setItem("singlePostId", id);
    setPage('mySinglePostFrame');
}

var pageNumber = 1;
var pageNumberSearch = 1;
var pageNumberTag = 1;
var option = "score";
var postSum;
var whichSearchType = "all";//all, text, tag

function disabledButton(id){
    document.getElementById(id).disabled = true;
    document.getElementById(id).classList.add("disabledButton");
}

function abledButton(id){
    document.getElementById(id).disabled = false;
    document.getElementById(id).classList.remove("disabledButton");
}

function editPageNum(sum){
    var begin = 1, end = Math.ceil((postSum/5));
    console.log("總頁數: "+end);
    
    var temp;
    sum = parseInt(sum);
    
    switch(whichSearchType){
        case "all":
            temp = pageNumber+sum;
            pageNumber = temp;
            searchAll("old");
            break;
        case "text":
            temp = pageNumberSearch+sum;
            pageNumberSearch = temp;
            searchText("old");
            break;
        case "tag":
            temp = pageNumberTag+sum;
            pageNumberTag = temp;
            searchTag("old");
            break;
    }
    console.log("temp: "+temp);
    if(temp == begin){
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    
    console.log("temp: "+temp);
    console.log("end: "+end);
    if(temp == end){
        disabledButton("forwardPage");
    }
    else{
        abledButton("forwardPage");
    }
}

///////////////// 透過標籤篩選 START /////////////////
// 用來記使用者選擇的所有標籤
var language = [];
var children = [];
var chosenTags = [];
// 以上3個都是放id
var allTags = {};

//根據chosenTags的內容 顯示已選擇的tags
function showChosenTags(page){
//    console.log("showChosenTags");
    var chosen_tag_content = "<hr>";
    var outer_content = "<br>";
    
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
        
        outer_content += '<label class="badge purpleLabel" style="margin-right: 5px;">';
            outer_content += allTags[chosenTags[i]];
        outer_content += '</label>';
    }

    document.getElementById("chosenTagInModalForSearch").innerHTML = chosen_tag_content;
    
    // 外面的最下面 也要顯示已選擇的tags
    document.getElementById("chosen_tag").innerHTML = outer_content;
}

// 顯示可選擇的語言「子」標籤
function click_tag(id, page){
    // tag -> 是選擇了哪個tag
    // page -> 是選語言(0) 還是選孩子(1)
    var tag = allTags[id];
    
    
    // 已選擇的tag START
    
    // card的最下面顯示已選擇的tags
    if(!chosenTags.includes(id)){ //如果還沒選過
//        console.log("顯示起來～");
        chosenTags.push(id);
        document.getElementById(id).setAttribute("style", "margin-right: 5px; background-color: #E6E6FA;");
        if(language.indexOf(id)==-1){
            showChosenTags(1);
//            console.log("page1");
        }
        else{
            showChosenTags(0);
//            console.log("page0");
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
    titleContent += '<i class="fa fa-angle-left scoreBtn" aria-hidden="true" onclick="showLanguageTag()" style="color: gray; margin-right: 5px;">上一頁</i>';
    
    document.getElementById("forwardPageInModal").innerHTML = titleContent;
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
    document.getElementById("choseTagForSearch").innerHTML = content;
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
//            console.log("success");
            //先記下allTags 包含名字&ID
            for(var i=0; i<response.tags.length; i++){
                language.push(response.tags[0]._id);
                allTags[response.tags[0]._id] = response.tags[0].tag;
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
    localStorage.setItem("chooseTags", 0);
    
    // 不要顯示上一頁
    document.getElementById("forwardPageInModal").innerHTML = "";
    
    var content = "";
    for(var i=0; i<language.length; i++){
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
    console.log("show語言標籤: "+content);
    document.getElementById("choseTagForSearch").innerHTML = content;
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
///////////////// 透過標籤篩選 END /////////////////

//---------- 篩選貼文方式 START -----------//
// 篩選時的一些處理
//function filter(){
////    language = [];
////    children = [];
////    chosenTags = [];
////    allTags = {};
////    getLanguageTag();
//    $("#aboutSearch").modal("show");
//
//    document.getElementById("searchAll").addEventListener("click", showSearchAll, false);
//    document.getElementById("searchText").addEventListener("click", showSearchTextInput, false);
//    document.getElementById("searchTag").addEventListener("click", showSearchTagInput, false);
//}
//
//// 隱藏打字＆選標籤的地方
//function showSearchAll(){
//    if($('input:radio[name="searchType"]:checked').val()=="searchAll"){
//        $("#searchTextContent").hide(); // 隱藏別人的
//        $("#searchTagContent").hide(); // 隱藏別人的
//        document.getElementById("chosen_tag").innerHTML = "";
//    }
//}
//
//// 顯示打字的地方
//function showSearchTextInput(){
////    console.log("值: "+$('input:radio[name="searchType"]:checked').val());
//    if($('input:radio[name="searchType"]:checked').val()=="searchText"){
//        $("#searchTextContent").show(); // 顯示自己的
//        $("#searchTagContent").hide(); // 隱藏別人的
//        document.getElementById("chosen_tag").innerHTML = "";
//    }
//}
//
//// 顯示選擇tag的地方
//function showSearchTagInput(){
//    if($('input:radio[name="searchType"]:checked').val()=="searchTag"){
//        $("#searchTagContent").show(); // 顯示自己的
//        $("#searchTextContent").hide(); // 隱藏別人的
//        showLanguageTag();
//        showChosenTags(0);
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
    switch(sortType){
        case "sortScore":
            option = "score";
            document.getElementById("optionText").innerHTML = "排序條件 | 依分數排序";
            break;
        case "sortView":
            option = "view_count";
            document.getElementById("optionText").innerHTML = "排序條件 | 依觀看次數排序";
            break;
        case "sortDate":
            option = "time";
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

function searchAll(which){
    whichSearchType = "all";
//    localStorage.setItem("method", "all");
    if(which == "new"){
        pageNumber = 1;
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    var myURL = head_url + "query_inner_post_list";
    
    var data = {page_size: 5, page_number: pageNumber, option: option};
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
//            console.log("成功: 拿所有貼文（query_inner_post_list）");
//            console.log(response);
            postSum = response.post_count;
            showPost(response.post_list);
        },
        error: function(){
//            console.log("失敗: 拿所有貼文（query_inner_post_list）");
        }
    });
}

// 透過字搜尋
function showSearchBar(){
    $("#searchBar").modal("show");
}
function searchText(which){
    // 搜尋方式改變 tag清空 START
    clearTags();
    // 搜尋方式改變 tag清空 END
    whichSearchType = "text";
    if(which == "new"){
        pageNumberSearch = 1;
        disabledButton("backwardPage");
    }
    else{
        abledButton("backwardPage");
    }
    var text = $("#searchTextContent2").val();
    
    var data = {title: text, page_size: 5, page_number: pageNumberSearch, option: option};
    console.log(data);

    var myURL = head_url + "query_inner_post_list_by_title";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 透過字搜尋貼文（query_inner_post_list_by_title）");
//            console.log(response);
            postSum = response.post_count;
            showPost(response.post_list);
        },
        error: function(response){
//            console.log("失敗: 透過字搜尋貼文（query_inner_post_list_by_title）");
//            console.log(response);
        }
    });
}

// 透過tag搜尋
function showSearchTag(){
    $("#aboutTag").modal('show');
}
function searchTag(which){
    whichSearchType = "tag";
    if(which == "new"){
        pageNumberTag = 1;
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
    
    var data = {tag: sendTags, page_size: 5, page_number: pageNumberTag, option: option};
//    console.log(data);
    
    var myURL = head_url + "query_inner_post_list_by_tag";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
//            console.log("成功: 透過tag搜尋貼文（query_inner_post_list_by_tag）");
//            console.log(response);
            postSum = response.post_count;
            showPost(response.post_list);
        },
        error: function(response){
//            console.log("失敗: 透過tag搜尋貼文（query_inner_post_list_by_tag）");
//            console.log(response);
        }
    });
}

function searchInnerPost(){
    var searchType = $('input:radio[name="searchType"]:checked').val();
    var sortType = $('input:radio[name="sortType"]:checked').val();
    var content = "篩選條件", contentSearch, contentSort;
    
    switch(sortType){
        case "sortScore":
            option = "score";
            contentSort = " | 依分數排序";
            break;
        case "sortView":
            option = "view_count";
            contentSort = " | 依觀看次數排序";
            break;
        case "sortDate":
            option = "time";
            contentSort = " | 依日期排序";
            break;
    }
    
    switch(searchType){
        case "searchAll":
            searchAll("new");
            contentSearch = " | 顯示全部";
            break;
        case "searchText":
            searchText("new");
            contentSearch = " | 相關的字";
            break;
        case "searchTag":
            searchTag("new");
            contentSearch = " | 相關標籤";
            break;
    }
    
    document.getElementById("optionText").innerHTML = content+contentSearch+contentSort;
}
//---------- 搜尋方法 END ----------//

// 顯示文章
function showPost(response){
    // 處理上下頁Button START
    if(postSum<=5){
        disabledButton("forwardPage");
    }
    else{
        abledButton("forwardPage");
    }
    // 處理上下頁Button END
    console.log("收到的資料: ");
    console.log(response);
    var role = localStorage.getItem("role");
//    console.log("這裡的response: ");
//    console.log(response);
    var content = "";
    if(response.length==0){
        content = '<div class="title">目前沒有符合的貼文</div>';
    }
    for(var i=0; i<response.length; i++){
        var id = response[i]._id;
        var title = response[i].title;
        var name;
//        console.log("title: "+title);
        var tag = response[i].tag;
        var time = new Date(response[i].time);
        time = time.toISOString();
        time = time.slice(0, 10);
        var score = response[i].score;
        if(response[i].incognito == true){
            name = "匿名";
        }
        else{
            name = response[i].asker_name;
        }

        content += '<div class="col-lg-4 col-xl-3 col-sm-12">';
        content += '<a href="#" onclick="setLocalStorage(';
        content += "'";
        content += id;
        content += "')";
        content += '">';

            content += '<div class="badge-box">';
                content += '<div class="sub-title">';
//                    if(role == "manager"){
//                        content += '<i class="fa fa-trash-o fa-lg" aria-hidden="true" style="color: red;"></i>';
//                    }
                    content += '<span>';
//                    if(response.incognito == true){
//                        content += '匿名';
//                    }
//                    else{
//                        content += response[i].asker_name;
//                    }
                    content += name;
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

function clearTags(){
    document.getElementById("chosen_tag").innerHTML = "";
    document.getElementById("chosenTagInModalForSearch").innerHTML = "";
    language = [];
    children = [];
    chosenTags = [];
    allTags = {};
    getLanguageTag();
}

function set(){
    localStorage.setItem("postType", "innerPost");
    localStorage.setItem("postAPI", "query_inner_post_list");
}

window.addEventListener("load", function(){
    set();
    searchAll("new");
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