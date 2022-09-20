class TreeNode {
    constructor(name, score) {
        this.name = name;
        this.score = score;
        this.child = [];
    }
}
var rootTreeNode;   //之後改成array
var secondLevelName = [];

//建好root, 並且建立第二層(呼叫secondLevel)
function getRootTag(){
    var myURL = head_url+"query_tag_child?tag_id=00000";
    //之後要改成檢查tag parent為null的，拿到所有語言
    
    $.ajax({
        url: myURL,
        type: "GET",
        async : false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            //先建好root
            rootTreeNode = new TreeNode("Python", 0);
            
            secondLevel(response);
        },
        error: function(){
            console.log("error");
        }
    });
}

//給id拿tagName
function getTagName(id){
    var myURL = head_url+"query_tag_name?tag_id="+id;
    var tagName;
    
    $.ajax({
        url: myURL,
        type: "GET",
        async : false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            tagName = response.tag_name;
        },
        error: function(){
            console.log("error");
        }
    });
    return tagName;
}

//先拿到第二層的tagName，直接從root tag的child array中拿
//創節點 且 加到rootTreeNode.child裡面
function secondLevel(data){
    for(var i=0; i<data.tag_child.length; i++){
        var tagName = data.tag_child[i].tag_name;
        //tagName = getTagName(data.tag_child[i]);
        
        secondLevelName.push(tagName);
        
        var temp = new TreeNode(tagName, 0);
        rootTreeNode.child.push(temp);
    }
}

// 建立第三層(創節點＋加到rootTreeNode.child[i].child裡面)
function buildThirdLevel(data){
    var temp = new TreeNode(data.tag_name, data.score);
    //var parentName = getTagName(data.parent);
    var parentName = data.parent.tag_name;
    //parentName.child.push(temp);
    if(secondLevelName.includes(parentName)){
        var index = secondLevelName.indexOf(parentName);
        rootTreeNode.child[index].child.push(temp);
    }
}

// 把用不到的節點刪除
function deleteEpmtyNode(){
    for(var i=rootTreeNode.child.length-1; i>=0; i--){
        if(rootTreeNode.child[i].child.length==0){
            rootTreeNode.child.splice(i, 1);
        }
    }
}

// 拿到user的skill
// 並且建立第三層(呼叫buildThirdLevel)
// 把用不到的第二層刪除(呼叫deleteEmptyNode)
function getUserTag(){
    var myURL = head_url+"query_user_tag?user_id="+localStorage.getItem("sessionID");
    $.ajax({
        url: myURL,
        type: "GET",
        async : false,
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        success: function(response){
            for(var i=0; i<response.tag_info.length; i++){
                //檢查是否為第三層，是則buildThirdLevel，否則直接改一、二層node score
                if(secondLevelName.includes(response.tag_info[i].tag_name)) {
                    rootTreeNode.child[secondLevelName.indexOf(response.tag_info[i].tag_name)].score = response.tag_info[i].score;
                }else if(response.tag_info[i].tag_name == rootTreeNode.name){
                    rootTreeNode.score = response.tag_info[i].score;
                }else{
                    buildThirdLevel(response.tag_info[i]);   
                }
            }
            //deleteEpmtyNode();
            //printTree();
        },
        error: function(){
            console.log("error");
        }
    });
    buildTree();
}

function printTree(){
    for(var i=0; i<rootTreeNode.child.length; i++){
//        console.log("2nd: "+rootTreeNode.child[i].name);
        for(var j=0; j<rootTreeNode.child[i].child.length; j++){
//            console.log("3rd: "+rootTreeNode.child[i].child[j].name);
        }
    }
}

var treeTag;
function buildTree(){
    console.log("tree: ");
    console.log(rootTreeNode);
    treeTag = "<li>"+rootTreeNode.name+"<br><div class='score'>"+rootTreeNode.score+"</div><ul>";
    //建出樹的tag
    for(var i=0;i<rootTreeNode.child.length;i++){
        treeTag += "<li>"+rootTreeNode.child[i].name+"<br><div class='score'>"+rootTreeNode.child[i].score+"</div><ul>";
        
        for(var j=0;j<rootTreeNode.child[i].child.length;j++){
            treeTag += "<li><div>";
            treeTag += rootTreeNode.child[i].child[j].name;
            treeTag += '<br>';
            treeTag += '<div class="score">';               treeTag += rootTreeNode.child[i].child[j].score;
            treeTag += "</div>";
            treeTag += "</div></li>";
        }
        
        treeTag += "</ul></li>";
    }
    
    treeTag += "</ul></li>";
    //console.log(treeTag);
    document.getElementById("org").innerHTML = treeTag;
    //console.log(document.getElementById("org"));
}

