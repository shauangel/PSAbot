function start(){
    console.log("start");
    //full_ans
    $.ajax({
        url: "test.json",
        type: "GET",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            console.log("success");
            document.getElementById("question_title").innerHTML = response.question.title;
            document.getElementById("question_detail").innerHTML = response.question.content;
            document.getElementById("abstract").innerHTML = response.question.abstract;
            var temp = "";
            temp += '<i class="fa fa-star"></i>score | ';
            temp += response.answers[0].score;
            temp += ' <p class="ans_show">';
            temp += response.answers[0].abstract;
            temp += "</p>";
            document.getElementById("best_ans_title").innerHTML = temp;
            //document.getElementById("like_dislike").innerHTML = '';
            document.getElementById("best_ans_detail").innerHTML = response.answers[0].content;
            var content = "", newURL = "", showlen;
            if(response.answers.length<4){
                showlen = response.answers.length+1;
            }
            else{
                showlen = 5;
            }
            
            for(var i=1; i<showlen; i++){
                newURL = response.link+"#answer-"+response.answers[i].id;
                console.log("newURL: "+newURL);
                console.log("in");
                //答案摘要開始
                content += '<div class="single-faq active">';
                content += '<div class="faq-heading" role="tab" id="faq'+(i+1)+'">';
                content += '<h4 class="faq-title">';
                content += '<font class="vote" style="margin-right: 16px;">0</font>';
                content += '<button type="button" class="fa fa-thumbs-o-down vote"></button>';
                content += '<font class="vote">0</font>';
                content += '<button type="button" class="fa fa-thumbs-o-up vote"></button>';
                content += '<a data-toggle="collapse"  href="#collapse'+(i+1)+'" aria-expanded="true" aria-controls="collapse'+(i+1)+'"><i class="fa fa-clone"></i><span class="score">score | ';
                content += response.answers[i].score;
                content += '</span><p class="ans_show">';
                content += response.answers[i].abstract;
                
                
                    
                content += '</p></a></h4></div>';
                //答案摘要結束
                
                //答案連結開始
                content += '<div id="collapse'+(i+1)+'" class="collapse" role="tabpanel" aria-labelledby="faq'+(i+1)+'" data-parent="#accordion">';
                content += '<div class="faq-body"><p><a href="';
                content +=  newURL;
                content += '" target="_balnk">點我看完整留言';
                content += '</a></p></div></div></div>';
                //答案連結結束							
            }
            document.getElementById("accordion").innerHTML += content;

        },
        error: function(){
            console.log("error");
        }
    });
}

window.addEventListener("load", start, false);