/**
 * Created by yusta on 12/23/16.
 */
$(READY);
var timerID; // to track the timer
function READY()
{
    $("#start").click(function()
    {
        $("#startscreen").slideUp();
        $("#overlay").fadeOut();
        $("#start").unbind();
    });
    theGame();
}

function theGame() {
    var started = false;
    var cantclick = false;
    $("#rem").html("49");
    $("#time").html("0");
    createBoard();
    distributeMines();
    $(".mark div").css("background-image", "url('images/mine.png')").hide();  //hide all mines initially

    $("img:first").attr("src", "images/happy.png").click(function () {
        reset();
        $("img:first").unbind();
        $(theGame());   //restart
    });

    $("#eye").click(function () {
        cantclick = true;
        $(".mark div").css("background-image", "url('images/mine.png')").hide().fadeIn(500).fadeOut(500, function(){
            cantclick = false;                                                         //cant click while eye button is working to avoid bugs
            $(".flagged div").css("background-image", "url('images/flag.png')").show() //hide flags display mines then show flags again
        });
    });

    $("#board td").click(function () {
        if (!cantclick) {
            console.log($(this).attr("class"));//for debugging

            if (!$(this).hasClass("flagged") && !$(this).hasClass("opened")){
                if (!started) {
                    started = true;
                    timerID = window.setInterval(function () {
                        $("#time").html(parseInt($("#time").html()) + 1);
                    }, 1000);
                }

                if ($(this).hasClass("mark")) {
                    $("img:first").attr("src", "images/angry.png");
                    $(".mark div").css("background-image", "url('images/mine.png')").show();
                    $(this).css("background-color", "#D96B61");
                    reset();
                }
                else{
                    countMines(this); //counts mines adjacent to the clicked cell
                }
            }
        }
    }).contextmenu(function(x) {    //adding or removing flags
        if (!cantclick) {
            x.preventDefault();
            if (!$(this).hasClass("opened")) {
                if (!$(this).hasClass("flagged")) {
                    $(this).addClass("flagged");
                    $(".flagged div").css("background-image", "url('images/flag.png')").show();
                }
                else {
                    $(this).removeClass("flagged");
                    $(this).children().hide();
                    $(this).css("background-image", "");    //displaying flags or mines correctly..
                }
            }
        }
    });
}
function createBoard()
{
    var b = "";
    var c = 0;
    for (var i = 0; i < 8; i++)
    {
        b += "<tr>";
        for (var j = 0; j < 8; j++)
        {
            b += "<td id='" + c + "'><div></div></td>"; //" + c + "
            c++;
        }
        b += "</tr>";
    }
    $("#board").html(b);
}

function distributeMines()
{
    var rnd = new Array(64);
    rnd.fill(0);
    rnd.fill(-1, 0, 15);
    for (var i = 0; i < 100; i++)
    {
        var x = Math.floor(Math.random() * 64);
        var y = Math.floor(Math.random() * 64);
        var tmp = rnd[x];
        rnd[x] = rnd[y];
        rnd[y] = tmp;
    }
    for (var i = 0; i < 64; i++)
        if ( rnd[i] === -1 )
        {
            $("#" + i).addClass("mark");
        }
}

function countMines(that)
{
    var cellid = parseInt($(that).attr("id"));
    var cells = new Array(8);   //put ids of surrounding cells in an array
    cells.fill(-1);
    /*
    upleft:0,up:1,upright:2,left:3,right:4,downleft:5
    down:6,downright:7
     */
    if (cellid % 8 != 0) //if not aligned to left
    {
        if ( cellid - 8 >= 0 )      //if not aligned to top
            cells[0] = cellid - 9;      //upleft is set
        cells[3] = cellid - 1;      //left is set
        if ( cellid + 8 <= 63)      //if not aligned to bottom
            cells[5] = cellid + 7;      //downleft is set
    }   //all left boxes are identified

    if (cellid % 8 != 7)//if not aligned to right
    {
        if (cellid - 8 >= 0)
            cells[2] = cellid - 7;   //upright is set
        cells[4] = cellid + 1;       //right is set
        if (cellid + 8 <= 63)
            cells[7] = cellid + 9;   //downright is set
    }   //all right boxes are identified

    if (cellid - 8 >= 0)
        cells[1] = cellid - 8;
    if (cellid + 8 <= 63)
        cells[6] = cellid + 8;
    //the remaining two up and down boxes are identified


    var count = 0;
    for (var x in cells)
    {
        if (cells[x] != -1 && $("#" + cells[x]).hasClass("mark"))   //start counting mines
        {
            count++;
        }
    }

    $(that).addClass("opened");
    $(that).children().show();
    $(that).children().css("background-image", ""); //making sure we dont show the previous flag on the cell accidentally (if there was one) displaying the number
    if (count != 0)
        $("div", that).addClass("c" + count);
    var remaining = parseInt($("#rem").html() - 1);
    $("#rem").html(remaining);
    if (remaining < 1)
    { //if there are no remaining cells you win.. else, the game continues
        $("div", that).html(count);
        success();
    }
    else {
        if (count != 0)
            $("div", that).html(count);
        else {
            for (var x in cells) {
                if (cells[x] != -1 && !$("#" + cells[x]).hasClass("mark")
                    && !$("#" + cells[x]).hasClass("opened") && !$("#" + cells[x]).hasClass("flagged")) {
                    countMines($("#" + cells[x]));
                }   //do the counting operation for all surrounding not marked, not opened, cells recursively if the clicked box has no neighbor marked cells
            }
        }
    }
}

function success()
{
    $("img:first").attr("src", "images/cool.png");
    $(".mark div").css("background-image", "url('images/flag.png')").show();
    reset();
}

function reset()
{
    window.clearTimeout(timerID);
    $("#eye").unbind();
    $("#board td").unbind();
}
