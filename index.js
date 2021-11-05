var grid = new Array(); //记录格子的二维数组，内容是0-9共十个数字
var size = 0; //数组的大小
var gameMain = document.getElementById("main"); //放整个扫雷格子的区域
var remain = 0; //记录剩余雷数
var opened = new Array(); //记录打开的格子的二维数组，-1是未打开，0是打开的空白格子，1是打开的数字格子，2是雷
var re = document.getElementById("remaining"); //显示剩余雷数的区域
var timer = null; //计时器
var second = 0; //秒数
var ti = document.getElementById("timing"); //显示用时的区域
var timeHistory = [
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
  "-- : --",
];
var recordedIndex = 0; //时间记录的最后一条的下标
var selections = document.getElementById("difficulty"); //难度选择框的区域
var tx;
var winFlag = false; //是否成功

//自定义大小
function customSize() {
  layer.prompt(
    {
      title: "请输入大于0的数字",
      formType: 0,
      anim: 4,
    },
    function (n, index) {
      layer.close(index);
      if (!isNaN(n) && n > 0) {
        init(n);
      } else {
        layer.msg("不是大于0的数字");
      }
    }
  );
}

//初始化，包括随机生成地雷和设置HTML
function init(n) {
  winFlag = false;
  size = n;

  let html = "";
  for (let i = 0; i < size; i++) {
    grid[i] = new Array();
    opened[i] = new Array();
    for (let j = 0; j < size; j++) {
      grid[i][j] = 0;
      opened[i][j] = -1;
    }
  }
  let val = selections.options[selections.selectedIndex].value;
  tx = selections.options[selections.selectedIndex].text;
  $("select").prop("disabled", true);
  layui.form.render("select");
  remain = Math.ceil((size * size) / val);

  generateMine();
  calculate();
  for (let i = 0; i < size; i++) {
    html += "<tr>";
    for (let j = 0; j < size; j++) {
      html += '<td id="' + i + "," + j + '"></td>';
    }
    html += "</tr>";
  }
  gameMain.innerHTML = html;
  gameMain.style["background-color"] = "gray";
  gameMain.style["pointer-events"] = "initial";
  let w = 50 * size + 20;
  gameMain.style["width"] = w + "px";
  re.innerHTML = "剩余地雷：" + remain;
  bindResponseToClick();

  //禁用右键菜单
  document.oncontextmenu = function () {
    return false;
  };

  clearInterval(timer);
  ti.innerHTML = "用时：-- : --";
  second = 0;
  timer = setInterval(function () {
    second++;
    let m = "" + parseInt(second / 60);
    if (parseInt(second / 60) < 10) {
      m = "0" + parseInt(second / 60);
    }
    let s = "" + parseInt(second % 60);
    if (parseInt(second % 60) < 10) {
      s = "0" + parseInt(second % 60);
    }
    ti.innerHTML = "用时：" + m + " : " + s;
  }, 1000);
}

//决定有地雷的格子
function generateMine() {
  for (let i = 0; i < remain; i++) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    if (grid[row][col] == 0) {
      grid[row][col] = 9;
    } else {
      i--;
    }
  }
}

//计算格子里应该提示的数字
function calculate() {
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      //8个方向分别搜索地雷
      if (grid[i][j] == 9) {
        continue;
      }
      if (i > 0) {
        if (grid[i - 1][j] == 9) {
          grid[i][j]++;
        }
      }
      if (i > 0 && j > 0) {
        if (grid[i - 1][j - 1] == 9) {
          grid[i][j]++;
        }
      }
      if (j > 0) {
        if (grid[i][j - 1] == 9) {
          grid[i][j]++;
        }
      }
      if (i > 0 && j < size - 1) {
        if (grid[i - 1][j + 1] == 9) {
          grid[i][j]++;
        }
      }
      if (i < size - 1 && j > 0) {
        if (grid[i + 1][j - 1] == 9) {
          grid[i][j]++;
        }
      }
      if (i < size - 1) {
        if (grid[i + 1][j] == 9) {
          grid[i][j]++;
        }
      }
      if (i < size - 1 && j < size - 1) {
        if (grid[i + 1][j + 1] == 9) {
          grid[i][j]++;
        }
      }
      if (j < size - 1) {
        if (grid[i][j + 1] == 9) {
          grid[i][j]++;
        }
      }
    }
  }
}

//鼠标事件的响应，左键打开、右键标记
function bindResponseToClick() {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let g = document.getElementById(i + "," + j);
      g.onmousedown = function (event) {
        var clickBtn = event.button;
        if (clickBtn == 0) {
          if (opened[i][j] == -1 && g.className != "mark") {
            //正常打开
            if (grid[i][j] == 9) {
              //踩雷了
              g.className = "boom";
              g.style["border"] = "1px solid white";
              g.style["background-color"] = "gray";
              gameMain.style["pointer-events"] = "none";
              opened[i][j] = 2;
              layer.msg("您失败了！", { time: 2000 });
              $("#difficulty").prop("disabled", false);
              layui.form.render("select");
              clearInterval(timer);
            } else if (grid[i][j] > 0 && grid[i][j] < 9) {
              //正常的格子
              g.innerHTML = grid[i][j];
              g.style["border"] = "1px solid white";
              g.style["background-color"] = "gray";
              opened[i][j] = 1;
            } else if (grid[i][j] == 0) {
              //空白格子
              show(i, j);
            }
          } else if (opened[i][j] == 1) {
            //快捷打开
            autoEliminateMine(i, j);
          }
          if (!winFlag && remain == 0 && checkArray()) {
            gameMain.style["pointer-events"] = "none";
            layer.msg("您成功了！", { time: 2000 });
            keepRecord();
            $("#difficulty").prop("disabled", false);
            layui.form.render("select");
            winFlag = true;
          }
        }

        if (clickBtn == 2) {
          if (g.style["background-color"] != "gray") {
            if (g.className != "mark") {
              g.className = "mark";
              opened[i][j] = 1;
              remain--;
            } else {
              g.className = "";
              opened[i][j] = -1;
              remain++;
            }
            re.innerHTML = "剩余地雷：" + remain;
          }
          if (!winFlag && remain == 0 && checkArray()) {
            gameMain.style["pointer-events"] = "none";
            layer.msg("您成功了！", { time: 2000 });
            keepRecord();
            $("#difficulty").prop("disabled", false);
            layui.form.render("select");
            winFlag = true;
          }
        }
      };
    }
  }
}

//连锁打开空白格子，直到有数字为止
function show(row, col) {
  if (!winFlag && remain == 0 && checkArray()) {
    gameMain.style["pointer-events"] = "none";
    alert("您成功了！");
    keepRecord();
    $("#difficulty").prop("disabled", false);
    layui.form.render("select");
    winFlag = true;
  }

  let g = document.getElementById(row + "," + col);
  g.style["border"] = "1px solid white";
  g.style["background-color"] = "gray";
  opened[row][col] = 0;
  if (grid[row][col] == 0) {
    g.style["pointer-events"] = "none";
  }
  if (grid[row][col] > 0 && grid[row][col] < 9) {
    g.innerHTML = grid[row][col];
    opened[row][col] = 1;
    return;
  }

  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      if (
        i >= 0 &&
        j >= 0 &&
        i < size &&
        j < size &&
        opened[i][j] == -1 &&
        g.className != "mark"
      ) {
        show(i, j);
      }
    }
  }
}

//快捷打开周围的格子
function autoEliminateMine(row, col) {
  let count = 0;
  for (let i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= size) {
      continue;
    }
    for (let j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= size) {
        continue;
      }
      let g = document.getElementById(i + "," + j);
      if (g.className == "mark") {
        count++;
      }
    }
  }
  //如果标记数等于该格的数字则说明用户认为雷已排完，否则不予动作
  if (count == grid[row][col]) {
    for (let i = row - 1; i <= row + 1; i++) {
      if (i < 0 || i >= size) {
        continue;
      }
      for (let j = col - 1; j <= col + 1; j++) {
        if (j < 0 || j >= size) {
          continue;
        }
        if ((i == row && j == col) || opened[i][j] != -1) {
          continue;
        }
        let g = document.getElementById(i + "," + j);
        if (g.className != "mark") {
          if (grid[i][j] == 9) {
            //踩雷了
            g.className = "boom";
            g.style["border"] = "1px solid white";
            g.style["background-color"] = "gray";
            gameMain.style["pointer-events"] = "none";
            opened[i][j] = 2;
            layer.msg("您失败了！", { time: 2000 });
            clearInterval(timer);
            $("#difficulty").prop("disabled", false);
            layui.form.render("select");
          } else if (grid[i][j] > 0 && grid[i][j] < 9) {
            //正常的格子
            g.innerHTML = grid[i][j];
            g.style["border"] = "1px solid white";
            g.style["background-color"] = "gray";
            opened[i][j] = 1;
          } else if (grid[i][j] == 0) {
            //空白格子
            show(i, j);
          }
        }
        if (!winFlag && remain == 0 && checkArray()) {
          gameMain.style["pointer-events"] = "none";
          layer.msg("您成功了！", { time: 2000 });
          keepRecord();
          $("#difficulty").prop("disabled", false);
          layui.form.render("select");
          winFlag = true;
        }
      }
    }
  }
}

//检测格子打开状况
function checkArray() {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (opened[i][j] == -1) {
        return false;
      }
    }
  }
  return true;
}

//成功后记录本次用时
function keepRecord() {
  clearInterval(timer);
  let m = "" + parseInt(second / 60);
  if (parseInt(second / 60) < 10) {
    m = "0" + parseInt(second / 60);
  }
  let s = "" + parseInt(second % 60);
  if (parseInt(second % 60) < 10) {
    s = "0" + parseInt(second % 60);
  }

  if (recordedIndex < 10) {
    recordedIndex++;
    timeHistory[recordedIndex] =
      m +
      " : " +
      s +
      "（大小：" +
      size +
      " × " +
      size +
      "；难度：" +
      tx +
      " ）";
  } else {
    for (let i = 0; i < timeHistory.length - 1; i++) {
      timeHistory[i] = timeHistory[i + 1];
    }
    timeHistory[9] =
      m +
      " : " +
      s +
      "（大小：" +
      size +
      " × " +
      size +
      "；难度：" +
      tx +
      " ）";
  }
}

//查看时间记录
function viewRecords() {
  let msg =
    '<div style="font-size: 1.1rem; line-height: 35px; padding-left: 15px;">';
  for (let i = 1; i < timeHistory.length; i++) {
    msg = msg + i + "、" + timeHistory[i];
    msg = msg + "<br />";
  }
  msg += "</div>";
  layer.open({
    type: 1,
    skin: "layui-layer-demo",
    closeBtn: 0,
    title: "记录",
    anim: 1,
    area: ["400px", "400px"],
    shadeClose: true,
    content: msg,
  });
}
