var head_url = "http://0.0.0.0:55001/api/";
//var head_url = "https://soselab.asuscomm.com:55001/api/";
//var head_url = "https://soselab.asuscomm.com:55002/api/";

function setPage(page){
    if(page!='comprehensive'){
        localStorage.removeItem("rankId");
    }
    if(page!='summary_new'){
        localStorage.removeItem("summaryId");
    }
    localStorage.setItem("page", page);
}

// 日期處理 STRAT

// 儲存時，日期轉成字串 傳給後端
function dateToString(datetime){
    var dateTime = new Date(datetime);
    var year = dateTime.getFullYear();
    var month = dateTime.getMonth()+1;//js從0開始取
    var date = dateTime.getDate();
    var hour = dateTime.getHours();
    var minutes = dateTime.getMinutes();
    var second = dateTime.getSeconds();
    var milliSecond = dateTime.getMilliseconds();

    if(month<10){
        month = "0" + month;
    }
    if(date<10){
        date = "0" + date;
    }
    if(hour <10){
        hour = "0" + hour;
    }
    if(minutes <10){
        minutes = "0" + minutes;
    }
    if(second <10){
        second = "0" + second ;
    }

    return year+"-"+month+"-"+date+"T"+hour+":"+minutes+":"+second+"."+milliSecond;
}

// 拿到時，日期轉成JS可用的形式
function dateToJsType(datetime){
    var week = datetime.slice(0, 3); //Wed
    var month = datetime.slice(8, 11); //Aug
    var day = datetime.slice(5, 7); //03
    var year = datetime.slice(12, 16); //2021
    var time = datetime.slice(17, 25); //18:18:38
    
    return week+" "+month+" "+day+" "+year+" "+time+" GMT+0800 (CST)";
}

// 日期處理 END

// 處理textarea裡面 tab的問題 START
$("textarea").keydown(function(e) {
    if(e.keyCode === 9) { // tab was pressed
        // get caret position/selection
        var start = this.selectionStart;
        var end = this.selectionEnd;

        var $this = $(this);
        var value = $this.val();

        // set textarea value to: text before caret + tab + text after caret
        $this.val(value.substring(0, start)
                    + "\t"
                    + value.substring(end));

        // put caret at right position again (add one for the tab)
        this.selectionStart = this.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault();
    }
});
// 處理textarea裡面 tab的問題 END

// 拿到某個人的大頭照
function getChatroomUserImg(userId){
    var imgSrc = "";
    if(userId == "PSAbot"){
        imgSrc = "../static/images/iconSmall.png";
    }
    else{
        var myURL = head_url + "read_image?user_id=" + userId;
        $.ajax({
            url: myURL,
            type: "GET",
            dataType: "json",
            async: false,
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                imgSrc = response.src;

            }
        });
    }
    return imgSrc;
}

// 共同討論某人是否匿名
// API -> check_member_is_incognito
function check_member_is_incognito(roomId, userId){
    console.log("roomId: "+roomId);
    console.log("userId: "+userId);
    
    if(userId == "PSAbot")
        return false;
    
    var incognito;
    var data = {room_id: roomId, user_id: userId};

    var myURL = head_url + "check_member_is_incognito";
    $.ajax({
        url: myURL,
        type: "POST",
        data: JSON.stringify(data),
        async: false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            incognito = response; 
        }
    });
    return incognito;
}
