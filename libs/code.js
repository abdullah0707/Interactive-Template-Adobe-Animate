var canvas,
  stage,
  exportRoot,
  anim_container,
  dom_overlay_container,
  fnStartAnimation;

var soundsArr,
  isSoundPlaying = false;
var numOfButtons = 6,
  currentB = 0,
  soundPlaying = null;
var clickSd, s1, s2, s3, s4, s5, s6, intro;
var l = console.log;

function init()
{
  canvas = document.getElementById("canvas");
  anim_container = document.getElementById("animation_container");
  dom_overlay_container = document.getElementById("dom_overlay_container");
  var comp = AdobeAn.getComposition("C09313FEE6AD8F4DBED28153F30080FB");
  var lib = comp.getLibrary();
  var loader = new createjs.LoadQueue(false);
  loader.addEventListener("fileload", function (evt)
  {
    handleFileLoad(evt, comp);
  });
  loader.addEventListener("complete", function (evt)
  {
    handleComplete(evt, comp);
  });
  var lib = comp.getLibrary();
  loader.loadManifest(lib.properties.manifest);
}

function handleFileLoad(evt, comp)
{
  var images = comp.getImages();
  if (evt && evt.item.type == "image")
  {
    images[evt.item.id] = evt.result;
  }
}

function handleComplete(evt, comp)
{
  //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
  var lib = comp.getLibrary();
  var ss = comp.getSpriteSheet();
  var queue = evt.target;
  var ssMetadata = lib.ssMetadata;
  for (i = 0; i < ssMetadata.length; i++)
  {
    ss[ssMetadata[i].name] = new createjs.SpriteSheet({
      images: [queue.getResult(ssMetadata[i].name)],
      frames: ssMetadata[i].frames,
    });
  }
  exportRoot = new lib.Scene3();
  stage = new lib.Stage(canvas);
  //Registers the "tick" event listener.
  fnStartAnimation = function ()
  {
    stage.addChild(exportRoot);
    stage.enableMouseOver(10);
    createjs.Touch.enable(stage);
    document.ontouchmove = function (e)
    {
      e.preventDefault();
    };
    stage.mouseMoveOutside = true;
    stage.update();
    createjs.Ticker.setFPS(lib.properties.fps);
    createjs.Ticker.addEventListener("tick", stage);
    prepareTheStage();
  };
  //Code to support hidpi screens and responsive scaling.
  function makeResponsive(isResp, respDim, isScale, scaleType)
  {
    var lastW,
      lastH,
      lastS = 1;
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function resizeCanvas()
    {
      var w = lib.properties.width,
        h = lib.properties.height;
      var iw = window.innerWidth,
        ih = window.innerHeight;
      var pRatio = window.devicePixelRatio || 1,
        xRatio = iw / w,
        yRatio = ih / h,
        sRatio = 1;
      if (isResp)
      {
        if (
          (respDim == "width" && lastW == iw) ||
          (respDim == "height" && lastH == ih)
        )
        {
          sRatio = lastS;
        } else if (!isScale)
        {
          if (iw < w || ih < h) sRatio = Math.min(xRatio, yRatio);
        } else if (scaleType == 1)
        {
          sRatio = Math.min(xRatio, yRatio);
        } else if (scaleType == 2)
        {
          sRatio = Math.max(xRatio, yRatio);
        }
      }
      canvas.width = w * pRatio * sRatio;
      canvas.height = h * pRatio * sRatio;
      canvas.style.width =
        dom_overlay_container.style.width =
        anim_container.style.width =
        w * sRatio + "px";
      canvas.style.height =
        anim_container.style.height =
        dom_overlay_container.style.height =
        h * sRatio + "px";
      stage.scaleX = pRatio * sRatio;
      stage.scaleY = pRatio * sRatio;
      lastW = iw;
      lastH = ih;
      lastS = sRatio;
      stage.tickOnUpdate = false;
      stage.update();
      stage.tickOnUpdate = true;
    }
  }
  makeResponsive(true, "both", true, 1);
  AdobeAn.compositionLoaded(lib.properties.id);
  fnStartAnimation();
  exportRoot["playBtn"].cursor = "pointer";
  exportRoot["playBtn"].addEventListener("click", playFn);
}

function playFn()
{
  stopAllSounds();
  clickSd.play();
  exportRoot.play();
}

function stopAllSounds()
{
  for (var s = 0; s < soundsArr.length; s++)
  {
    soundsArr[s].stop();
    soundsArr[s].mute(false);
  }

  // exportRoot.soundBtn.gotoAndStop(0);
  isSoundPlaying = false;
}

function prepareTheStage()
{
  clickSd = new Howl({
    src: ["sounds/click.mp3"],
  });
  intro = new Howl({
    src: ["sounds/intro.mp3"],
  });
  s1 = new Howl({
    src: ["sounds/s1.mp3"],
  });
  s2 = new Howl({
    src: ["sounds/s2.mp3"],
  });
  s3 = new Howl({
    src: ["sounds/s3.mp3"],
  });
  s4 = new Howl({
    src: ["sounds/s4.mp3"],
  });
  s5 = new Howl({
    src: ["sounds/s5.mp3"],
  });
  s6 = new Howl({
    src: ["sounds/s6.mp3"],
  });

  soundsArr = [intro, s1, s2, s3, s4, s5, s6, clickSd];
  stopAllSounds();
  // exportRoot.soundBtn.cursor = "pointer";
  // exportRoot.soundBtn.addEventListener("click", playSoundFn);

  for (let i = 1; i <= numOfButtons; i++)
  {
    exportRoot["b" + i].id = i;
    exportRoot["a" + i].id = i;
    exportRoot["a" + i].playV = false;
  }

  hideScreens();
}

function hideScreens()
{
  for (let i = 1; i <= numOfButtons; i++)
  {
    l(i);
    exportRoot["a" + i].alpha = 0;
  }
}

function activateButtons()
{
  for (let i = 1; i <= numOfButtons; i++)
  {
    exportRoot["b" + i].cursor = "pointer";
    exportRoot["b" + i].gotoAndStop(0)
    exportRoot["b" + i].addEventListener("mouseover", over2);
    exportRoot["b" + i].addEventListener("mouseout", out);
    exportRoot["b" + i].addEventListener("click", clickFn);
  }
}
function deactivateButton()
{
  for (let i = 1; i <= numOfButtons; i++)
  {
    exportRoot["b" + i].cursor = "auto";
    exportRoot["b" + i].removeEventListener("mouseover", over2);
    exportRoot["b" + i].removeEventListener("mouseout", out);
    exportRoot["b" + i].removeEventListener("click", clickFn);
  }
}

// Show Next Questions And Select Answer
function clickFn(e)
{
  stopAllSounds();
  clickSd.play(); // Sounds Click
  deactivateButton();
  exportRoot["a" + e.currentTarget.id].playV = true;
  exportRoot["a" + e.currentTarget.id].alpha = 1;
  exportRoot["a" + e.currentTarget.id].gotoAndPlay(0);
}
function closeFn()
{
  clickSd.play();
  stopAllSounds();
  activateButtons();
  hideScreens();
}
function out(e)
{
  exportRoot["b" + e.currentTarget.id].gotoAndStop(0);
}

function over(e)
{
  exportRoot["b" + e.currentTarget.id].gotoAndStop(1);
}
function over2(e)
{
  exportRoot["b" + e.currentTarget.id].gotoAndStop(2);
}
