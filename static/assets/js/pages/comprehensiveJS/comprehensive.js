function start(){
    var myURL = head_url+"query_cache_by_id";
    console.log("myURL: "+myURL);
    var rankId = localStorage.getItem("rankId");
    var data = {id: rankId};
    console.log("送出的data: ");
    console.log(data);
//    var address = 'stackoverflowRank.json';
    $.ajax({
        url: myURL,
        data: JSON.stringify(data),
        type: "POST",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log(response);
            rankContent(response);
        },
        error: function(response){
            console.log("error: ");
            console.log(response);
        }
    });
}

function rankContent(response){
    console.log("rank: ");
    console.log(response);
    var comment = document.getElementById("accordion");
    var content = "";
    for(var i=0; i<response.answers.length; i++){
//        console.log("i: "+i);
        content += '<div class="accordion-panel">';//第一個div
            //----- 標題 START -----//
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
                    
        
            // like & dislike
//                content += '<i class="fa fa-thumbs-o-up" aria-hidden="true" onclick="like(';
//                var temp = "like"+i;
//                content += "'";
//                content += temp;
//                content += "'";
//                content += ')"></i>';
//                content += '<span id="like';
//                content += i;
//                content += '" style="margin-right: 5px; color: gray;">0</span>';
//
//                content += '<i class="fa fa-thumbs-o-down" aria-hidden="true" onclick="dislike(';
//                var temp = "dislike"+i;
//                content += "'";
//                content += temp;
//                content += "'";
//                content += ')"></i>';
//                content += '<span id="dislike';
//                content += i;
//                content += '" style="margin-right: 5px; color: gray;">0</span>';
//                        content += '<button type="button" class="scoreBtn"><i class="fa fa-thumbs-up" aria-hidden="true"></i></button>';
//                        content += '<button type="button" class="scoreBtn" style="margin-right: 10px;"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i></button>';
                        content += '<span style="margin-right: 5px; color: #505458; float: right;">';
                        content += parseInt((response.answers[i].score*100));
                        content += '</span>';
                    
                        content += '<i class="fa fa-trophy" aria-hidden="true" style="color: #505458; float: right;"></i>';
                        
                    content += '</a>';
                content += '</h3>';
            content += '</div>';
            //----- 標題 END -----//
        
            //----- 解答 START -----//
            content += '<div id="collapse';
            content += i;
            content += '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading';
            content += i;
            content += '">';

                content += '<div class="accordion-content accordion-desc">';
        
                    content += '<p>';
                        content += '<a href="';
                        content += response.answers[i].link;
                        content += '#';
                        content += response.answers[i]._id;
                        content += '" target="_blank">點我看原文</a><br><br>';
                        content += response.answers[i].content;
                    content += '</p>';
                content += '</div>';
            content += '</div>';
            //----- 解答 END -----//
        content += '</div>'
    }
    comment.innerHTML = content;
}

window.addEventListener("load", start, false);