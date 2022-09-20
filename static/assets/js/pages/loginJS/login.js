/* ================ login card nav bar ================ */
$('#bologna-list a').on('click', function (e) {
  e.preventDefault()
  $(this).tab('show')
})
/* ================================================= */
/* ================ Facebook Login ================= */
// 設定 Facebook JavaScript SDK
var auth2;
window.fbAsyncInit = function () {
  FB.init({
    appId: '1018939978932508',
    cookie: true,
    xfbml: true,
    version: 'v11.0'
  });

  FB.AppEvents.logPageView();

};

(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// 檢查Facebook登入狀態
function checkLoginState() {
  // 先清空localStorage
  localStorage.clear();
  // 取得登入狀態資訊
  FB.login(function (response) {
    if (response.status === 'connected') {
      // 若已登入則利用facebook api取得使用者資料
      FB.api(
        '/me',
        'GET', {
        "fields": "id,name"
      },
        function (response) {
          console.log(response);
          //              console.log("傳到後端的: "+response);
          // 取得使用者資料丟到後端
            var myURL = head_url + 'facebook_sign_in';
            console.log("HTTP POST - facebook_sign_in的URL: "+myURL);
          $.ajax({
            type: "POST",
            url: myURL,
            data: JSON.stringify(response),
            async: false,
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function (response_data) {
                console.log("facebook_sign_in的回覆: ");
              console.log(response_data);
              //慈 START
              localStorage.setItem("sessionID", response_data['_id']);
              localStorage.setItem("role", "facebook_user");
              localStorage.setItem("first_login", response_data['first_login']);
                //window.location.href = 'http://soselab.asuscomm.com:55001/site/PSAbot';
              window.location.href = 'https://soselab.asuscomm.com:55002/site/PSAbot';
              //慈 END
            },
            error: function (xhr, status, error) {
              console.log('get_data: ' + xhr.responseText + status + ',error_msg: ' + error);
            }
          });
        });
    }
  }
    //    , { auth_type: 'reauthenticate' }
  );
}

/* ================================================= */
/* ================ Google Sign in ================= */
function onLoadGoogleCallback() {
  gapi.load('auth2', function () {
    auth2 = gapi.auth2.init({
      client_id: '417777300686-b6isl0oe0orcju7p5u0cpdeo07hja9qs.apps.googleusercontent.com',
      cookiepolicy: 'none',
      scope: 'profile'
    });

    auth2 = gapi.auth2.getAuthInstance();
    auth2.currentUser.listen(userChanged);
  });
}

function googleSignIn() {
  console.log('click btn');
  auth2.signIn();
  console.log('user changed. id: ' + auth2.currentUser.get().getId());
}

function userChanged(googleUser) {
  if (googleUser.getId() != null) {
    //傳送access token至後端驗證
    console.log('user changed. id: ' + googleUser.getId())
      
      var myURL = head_url + 'google_sign_in';
      console.log("HTTP POST - google_sign_in的URL: "+myURL);
    $.ajax({
      type: "POST",
      url: myURL,
      data: JSON.stringify({
        'id_token': googleUser.getAuthResponse().id_token
      }),
      dataType: "json",
      contentType: 'application/json; charset=utf-8',
      success: function (response_data) {
          console.log("google_sign_in的回覆: ");
          console.log(response_data);
          
        localStorage.setItem("sessionID", response_data['_id']);
        localStorage.setItem("role", "google_user");
        localStorage.setItem("first_login", response_data['first_login']);
        //慈 START
        window.location.href = 'https://soselab.asuscomm.com:55002/site/PSAbot';
        //window.location.href = 'http://soselab.asuscomm.com:55001/site/PSAbot';
        //慈 END
        console.log('user_id :' + localStorage.getItem('sessionID') + ' ,role: ' + localStorage.getItem('role') + ' has logged in.')
      },
      error: function (xhr, status, error) {
        console.log('get_data: ' + xhr.responseText + status + ',error_msg: ' + error);
      }
    });
  }
}
/* ================================================= */
/* ================ Manager Sign in ================= */
function managerLogin() {
    var user = document.getElementById("inputUser").value;
    var password = document.getElementById("inputPassword").value;
    console.log('user :' + user + ' ,password: ' + password);
    var myURL = head_url + 'password_sign_in';
    $.ajax({
    type: "POST",
    url: myURL,
    data: JSON.stringify({
      '_id': user,
      'password': password,
    }),
    dataType: "json",
    contentType: 'application/json; charset=utf-8',
    success: function (response_data) {
        if (response_data['_id'] == 'invalid.') {
            alert('帳號或密碼錯誤');
        }
        else if (response_data['_id'] == user) {
            console.log(response_data)
            localStorage.setItem("sessionID", response_data['_id']);
            localStorage.setItem("role", response_data['role']);
            console.log('user_id :' + localStorage.getItem('sessionID') + ' ,role: ' + localStorage.getItem('role') + ' has logged in.');
            window.location.href = 'https://soselab.asuscomm.com:55002/site/PSAbot';
            //window.location.href = 'http://soselab.asuscomm.com:55001/site/PSAbot';
        }
    },
    error: function (xhr, status, error) {
      console.log('get_data: ' + xhr.responseText + status + ',error_msg: ' + error);
    }
    });

}
/* ================================================= */


/* ================ 訪客 START ================= */
function visitor(){
    //window.location.href = "http://soselab.asuscomm.com:5500/site/PSAbot";
    window.location.href = "https://soselab.asuscomm.com:55002/site/PSAbot";
}
/* ================ 訪客 END ================= */