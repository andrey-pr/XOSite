/**
 * Created by Artem on 20.04.2017.
 */
var socket;
var game_token;
window.onload = function () {
    socket = new WebSocket("ws://37.46.229.84:80");
    socket.onopen = onopen;
    socket.onmessage = onmessage;
    socket.onerror = onerror;
    socket.onclose = onclose;
};
function onopen() {
    console.log("connect");
    socket.send("XO;GET_USERS;");
    socket.send("XO;NEW_USER;" + prompt("login") + ";");
};
function onmessage(event) {
    console.log(event.data);
    var str = event.data.split(';');
    console.log(str[0] + "(" + event.data + ");");
    eval(str[1] + "(\"" + event.data + "\");");
}
function onclose(event) {
    alert("Обрыв соединения: " + event.wasClean + event.code + event.reason);
}
function onerror(event) {
    alert("Обрыв соединения: " + event.message);
}
function USERS(data) {
    console.log(data);
    var str = data.split(";");
    var parent = document.getElementById("opponentslist");
    parent.innerHTML = "";
    var newLi;
    console.log(str);
    for(var i = 2; i < str.length-1; i++)
    {
        console.log(i);
        console.log(str[i]);
        newLi = document.createElement('li');
        newLi.innerHTML = str[i];
        eval("newLi.onclick = function () { socket.send(\"XO;GAME_REQUEST;" + str[i] + ";\"); }");
        parent.appendChild(newLi);
    }
    if(str.length < 4)
    {
        document.getElementById("warning_message").style.display = "block";
    }

}

function EXIST(data) {
    document.getElementById("login").innerHTML = data.split(";")[2];
}

function NEW_OPPONENT(data) {
    document.getElementById("warning_message").style.display = "none";
    var str = data.split(";");
    var parent = document.getElementById("opponentslist");
    var newLi = document.createElement('li');
    newLi.innerHTML = str[2];
    eval("newLi.onclick = function () { socket.send(\"XO;GAME_REQUEST;" + str[2] + ";\"); }");
    parent.appendChild(newLi);
}

function POTENTIAL_OPPONENT_EXIT(data) {
    var str = data.split(";");
    socket.send("XO;GET_USERS;");
}

function NEW_ROOM(data) {
    var str = data.split(";");
    game_token = str[2];
    document.getElementById("opponents").style.display = "none";
    document.getElementById("gamefield").style.display = "block";
}

function NEW_COURSE(data) {
    var symbol;
    var str = data.split(";");
    if(str[3] == "x") {
        // symbol = document.createElement("image");
        // symbol.height = 50;
        // symbol.width = 50;
        // symbol.href = "x.png";
        symbol = "<image xlink:href=\"x.png\" x=\"" + Math.floor(((+str[2])-1)/3)*100 + "\" y=\"" + ((+str[2])-1)%3*100 + "\" width=\"100px\" height=\"100px\"></image>";
    }
    else {
        // symbol = document.createElement("circle");
        // symbol.r = 50;
        symbol = "<circle cx=\"" + (parseInt(Math.floor(((+str[2])-1)/3)*100, 10)+50) + "px\" cy=\"" + (parseInt(((+str[2])-1)%3*100, 10)+50) + "px\" r=\"50px\"></circle>";
    }
    // symbol.x = Math.floor((+str[2])/3)*100;
    // symbol.y = (+str[2])%3*100;
    document.getElementById("gamecanvas").innerHTML += symbol;
    // document.getElementById("gamecanvas").appendChild(symbol);
}

function GAME_REQUEST(data) {
    var str = data.split(";");
    if(confirm("С вами хочет играть " + str[2]))
        socket.send("XO;GAME_RESPONSE;" + str[2] + ";1;");
    else
        socket.send("XO;GAME_RESPONSE;" + str[2] + ";0;");
}
document.getElementById("gamecanvas").onclick = function (e) {
    console.log("clicked");
    if(e.offsetY < 100) {
        console.log("1");
        if (e.offsetX < 100)
            socket.send("XO;COURSE;1;" + game_token + ";");
        else if (e.offsetX > 100 && e.offsetX < 200)
            socket.send("XO;COURSE;4;" + game_token + ";");
        else if (e.offsetX > 200)
            socket.send("XO;COURSE;7;" + game_token + ";");
    }
    else if(e.offsetY > 100 && e.offsetY < 200) {
        console.log("2");
        if (e.offsetX < 100)
            socket.send("XO;COURSE;2;" + game_token + ";");
        else if (e.offsetX > 100 && e.offsetX < 200)
            socket.send("XO;COURSE;5;" + game_token + ";");
        else if (e.offsetX > 200)
            socket.send("XO;COURSE;8;" + game_token + ";");
    }
    else if(e.offsetY > 200) {
        console.log("3");
        if (e.offsetX < 100)
            socket.send("XO;COURSE;3;" + game_token + ";");
        else if (e.offsetX > 100 && e.offsetX < 200)
            socket.send("XO;COURSE;6;" + game_token + ";");
        else if (e.offsetX > 200)
            socket.send("XO;COURSE;9;" + game_token + ";");
    }
    else
        console.log("4");
}

function YOUR_COURSE(data) {

}

function LOSE(data) {
    var str = data.split(";");
    drawWinLine((parseInt(Math.floor(((+str[2])-1)/3)*100, 10)+50), (parseInt(((+str[2])-1)%3*100, 10)+50), (parseInt(Math.floor(((+str[3])-1)/3)*100, 10)+50), (parseInt(((+str[3])-1)%3*100, 10)+50));
    setTimeout(onLose, 10);
}

function onLose() {
    alert("Вы проиграли");
    toListUsers();
}

function WIN(data) {
    var str = data.split(";");
    drawWinLine((parseInt(Math.floor(((+str[2])-1)/3)*100, 10)+50), (parseInt(((+str[2])-1)%3*100, 10)+50), (parseInt(Math.floor(((+str[3])-1)/3)*100, 10)+50), (parseInt(((+str[3])-1)%3*100, 10)+50));
    setTimeout(onWin, 10);

}

function onWin() {
    alert("Вы выиграли");
    toListUsers();
}

function DRAW(data) {
    setTimeout(onDraw, 10);
}

function onDraw() {
    alert("Ничья");
    toListUsers();
}

function drawWinLine(x1, y1, x2, y2) {
    document.getElementById("gamecanvas").innerHTML += "<line x1=\"" + x1 + "\" y1=\"" + y1 + "\" x2=\"" + x2 + "\" y2=\"" + y2 + "\" style=\"stroke: black; stroke-width: 10;\"></line>";
}

function toListUsers()
{
    socket.send("XO;GET_USERS;")
    document.getElementById("opponents").style.display = "block";
    document.getElementById("gamefield").style.display = "none";
    var parent = document.getElementById("gamecanvas");
    var nl = parent.childNodes;
    console.log(nl);
    for(var i = 0; i < nl.length; i++)
        if(nl.item(i).id != "mainline")
        {
            parent.removeChild(nl.item(i));
            i--;
        }
}