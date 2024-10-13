var canvas,
	stage,
	exportRoot,
	anim_container,
	dom_overlay_container,
	fnStartAnimation;

var soundsArr;
var video, video_div;
var clickSd, goodSd, errorSd, quizSd, rightFbSd, wrongFbSd;

var quizNum = 3,
	ansPerQ = [15, 19, 24],
	ansTrue = 58;
otherAns = 62;

var currentQ = 1,
	score = 0,
	finalScore = 0,
	ansCounter = 0;

var attempts = 0,
	maxAttempts = 3;

var overOut = [];
var retryV = false;
var l = console.log;

var boolV = false;

function init() {
	canvas = document.getElementById("canvas");
	anim_container = document.getElementById("animation_container");
	dom_overlay_container = document.getElementById("dom_overlay_container");
	var comp = AdobeAn.getComposition("11DFB551142E1B4D9E5FEA9F79242AA0");
	var lib = comp.getLibrary();
	var loader = new createjs.LoadQueue(false);
	loader.addEventListener("fileload", function (evt) { handleFileLoad(evt, comp) });
	loader.addEventListener("complete", function (evt) { handleComplete(evt, comp) });
	var lib = comp.getLibrary();
	loader.loadManifest(lib.properties.manifest);
}
function handleFileLoad(evt, comp) {
	var images = comp.getImages();
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }
}
function handleComplete(evt, comp) {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib = comp.getLibrary();
	var ss = comp.getSpriteSheet();
	exportRoot = new lib._13();
	stage = new lib.Stage(canvas);
	//Registers the "tick" event listener.
	var lib = comp.getLibrary();
	var ss = comp.getSpriteSheet();
	var queue = evt.currentTarget;
	var ssMetadata = lib.ssMetadata;
	for (i = 0; i < ssMetadata.length; i++) {
		ss[ssMetadata[i].name] = new createjs.SpriteSheet({
			images: [queue.getResult(ssMetadata[i].name)],
			frames: ssMetadata[i].frames,
		});
	}
	fnStartAnimation = function () {
		stage.addChild(exportRoot);
		stage.enableMouseOver(10);
		createjs.Touch.enable(stage);
		document.ontouchmove = function (e) {
			e.preventDefault();
		};
		stage.mouseMoveOutside = true;
		stage.update();
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);
		prepareTheStage();
	};
	//Code to support hidpi screens and responsive scaling.
	function makeResponsive(isResp, respDim, isScale, scaleType) {
		var lastW,
			lastH,
			lastS = 1;
		window.addEventListener("resize", resizeCanvas);
		resizeCanvas();

		function resizeCanvas() {
			var w = lib.properties.width,
				h = lib.properties.height;
			var iw = window.innerWidth,
				ih = window.innerHeight;
			var pRatio = window.devicePixelRatio || 1,
				xRatio = iw / w,
				yRatio = ih / h,
				sRatio = 1;
			if (isResp) {
				if (
					(respDim == "width" && lastW == iw) ||
					(respDim == "height" && lastH == ih)
				) {
					sRatio = lastS;
				} else if (!isScale) {
					if (iw < w || ih < h) sRatio = Math.min(xRatio, yRatio);
				} else if (scaleType == 1) {
					sRatio = Math.min(xRatio, yRatio);
				} else if (scaleType == 2) {
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
	exportRoot["playBtn"].addEventListener("click", playVideo);
}

function playVideo() {
	exportRoot["playBtn"].alpha = 0;
	exportRoot["playBtn"].removeEventListener("click", playVideo);
	video_div = document.getElementById("videoPlay").style.display =
		"inline-block";

	video = document.getElementById("videoPlay").play();
	setTimeout(function () {
		exportRoot.gotoAndStop(2);
	}, 300);
	document.getElementById("videoPlay").onended = function () {
		videoEnd();
	};

	// exportRoot.play();
}

function videoEnd() {
	exportRoot.play();
	document.getElementById("videoPlay").style.display = "none";
	exitFullscreen();
	console.log("Play");
}

function prepareTheStage() {
	overOut = [
		exportRoot["showAnsBtn"],
		exportRoot["confirmBtn"],
		exportRoot["retryBtn"],
	];
	for (var i = 0; i < overOut.length; i++) {
		console.log(i);
		overOut[i].cursor = "pointer";
		overOut[i].on("mouseover", over);
		overOut[i].on("mouseout", out);
	}

	// exportRoot["startBtn"].on("mouseover", over2);

	clickSd = new Howl({
		src: ["sounds/click.mp3"],
	});
	goodSd = new Howl({
		src: ["sounds/good.mp3"],
	});
	errorSd = new Howl({
		src: ["sounds/error.mp3"],
	});
	rightFbSd = new Howl({
		src: ["sounds/rightFbSd.mp3"],
	});
	wrongFbSd = new Howl({
		src: ["sounds/wrongFbSd.mp3"],
	});
	quizSd = new Howl({
		src: ["sounds/quizSd.mp3"],
	});

	soundsArr = [clickSd, goodSd, errorSd, quizSd, rightFbSd, wrongFbSd];
	stopAllSounds();

	for (var q = 1; q <= quizNum; q++) {
		for (var i = 1; i <= ansPerQ[q - 1]; i++) {
			l(`q${q}_a${i}`);
			exportRoot[`q${q}_a${i}`].qNum = q;
			exportRoot[`q${q}_a${i}`].id = i;
			exportRoot[`q${q}_a${i}`].clicked = false;
			exportRoot[`q${q}_p${i}`].id = i;
			exportRoot[`q${q}_p${i}`].plsNum = null;
		}
	}

	for (var a = 1; a <= otherAns; a++) {
		exportRoot[`a${a}`].qNum = 0;
		exportRoot[`a${a}`].id = a;
		exportRoot[`a${a}`].clicked = false;
	}

	exportRoot["confirmBtn"].addEventListener("click", confirmFN);

	exportRoot["retryBtn"].addEventListener("click", retryFN);
	exportRoot["showAnsBtn"].addEventListener("click", function () {
		// hideFB();
		stopAllSounds();
		exportRoot["showAnsBtn"].alpha = 0;
		exportRoot["answers"].alpha = 1;
		exportRoot["answers"].gotoAndPlay(0);
	});

	hideFB();
}

function hideFB() {
	exportRoot["wrongFB"].alpha = 0;
	exportRoot["wrongFB"].playV = false;
	exportRoot["rightFB"].alpha = 0;
	exportRoot["rightFB"].playV = false;

	exportRoot["answers"].alpha = 0;
	exportRoot["answers"].playV = false;
	exportRoot["retryBtn"].alpha = 0;
	exportRoot["retryBtn"].gotoAndStop(0);
	exportRoot["showAnsBtn"].alpha = 0;
	exportRoot["showAnsBtn"].gotoAndStop(0);
	exportRoot["confirmBtn"].alpha = 0;
	exportRoot["confirmBtn"].gotoAndStop(0);

	exportRoot["hideSymb"].alpha = 0;
}

function stopAllSounds() {
	for (var s = 0; s < soundsArr.length; s++) {
		soundsArr[s].stop();
	}
}

function activateAnsFun() {
	for (var q = 1; q <= quizNum; q++) {
		for (var i = 1; i <= ansPerQ[q - 1]; i++) {
			if (retryV) {
				exportRoot[`q${q}_a${i}`].gotoAndStop(0);
				exportRoot[`q${q}_a${i}`].clicked = false;
				exportRoot[`q${q}_p${i}`].gotoAndStop(0);
				exportRoot[`q${q}_p${i}`].plsNum = null;
				if (q == currentQ) {
					exportRoot[`q${q}_p${i}`].alpha = 1;
				}
			}
			exportRoot[`q${q}_a${i}`].cursor = "pointer";
			exportRoot[`q${q}_a${i}`].addEventListener("click", chooseAnsFn);
			exportRoot[`q${q}_a${i}`].addEventListener("mouseover", over);
			exportRoot[`q${q}_a${i}`].addEventListener("mouseout", out);
		}
	}

	for (var a = 1; a <= otherAns; a++) {
		if (retryV) {
			exportRoot[`a${a}`].gotoAndStop(0);
			exportRoot[`a${a}`].clicked = false;
		}
		exportRoot[`a${a}`].cursor = "pointer";
		exportRoot[`a${a}`].addEventListener("click", chooseAnsFn);
		exportRoot[`a${a}`].addEventListener("mouseover", over);
		exportRoot[`a${a}`].addEventListener("mouseout", out);
	}

	console.log("activateAnsFun");

	exportRoot["confirmBtn"].cursor = "pointer";
	exportRoot["confirmBtn"].addEventListener("click", confirmFN);
}

function deactivateAnsFun() {
	for (var q = 1; q <= quizNum; q++) {
		for (var i = 1; i <= ansPerQ[q - 1]; i++) {
			exportRoot[`q${q}_a${i}`].cursor = "auto";
			exportRoot[`q${q}_a${i}`].removeEventListener("click", chooseAnsFn);
			exportRoot[`q${q}_a${i}`].removeEventListener("mouseover", over);
			exportRoot[`q${q}_a${i}`].removeEventListener("mouseout", out);
		}
	}

	for (var a = 1; a <= otherAns; a++) {
		if (retryV) {
			exportRoot[`a${a}`].gotoAndStop(0);
			exportRoot[`a${a}`].clicked = false;
		}

		exportRoot[`a${a}`].cursor = "auto";
		exportRoot[`a${a}`].removeEventListener("click", chooseAnsFn);
		exportRoot[`a${a}`].removeEventListener("mouseover", over);
		exportRoot[`a${a}`].removeEventListener("mouseout", out);
	}
}

function chooseAnsFn(e2) {
	stopAllSounds();
	clickSd.play(); // Sounds Click

	e2.currentTarget.gotoAndStop(2); // Active Button click After Select
	e2.currentTarget.cursor = "auto";
	e2.currentTarget.removeEventListener("click", chooseAnsFn);
	e2.currentTarget.removeEventListener("mouseover", over);
	e2.currentTarget.removeEventListener("mouseout", out);
	ansCounter++;
	if (ansCounter == ansPerQ[currentQ - 1]) {

		for (let i = 1; i <= ansPerQ[currentQ - 1]; i++) {
			if (exportRoot[`q${currentQ}_p${i}`].plsNum != null) {
				exportRoot["confirmBtn"].alpha = 1;
				break;
			}
		}
	}

	// }
	if (e2.currentTarget.qNum == currentQ) {
		var idNum = e2.currentTarget.id;
		l("currentQ: " + currentQ);
		l("idNum: " + idNum);
		if (e2.currentTarget.clicked) {
			exportRoot[`q${currentQ}_p${idNum}`].gotoAndStop(0);
			exportRoot[`q${currentQ}_p${idNum}`].plsNum = null;
			exportRoot[`q${currentQ}_a${idNum}`].addEventListener("click", chooseAnsFn);
			exportRoot[`q${currentQ}_a${idNum}`].addEventListener("mouseover", over);
			exportRoot[`q${currentQ}_a${idNum}`].addEventListener("mouseout", out);
		} else {
			exportRoot[`q${currentQ}_p${idNum}`].gotoAndStop(1);
			exportRoot[`q${currentQ}_p${idNum}`].plsNum = idNum;
		}
	}
	e2.currentTarget.clicked = !e2.currentTarget.clicked;
}

function chooseAnsFn(e2) {
	stopAllSounds();
	clickSd.play(); // Sounds Click

	if (e2.currentTarget.clicked) {
		e2.currentTarget.gotoAndStop(0); // Active Button click After Select
		e2.currentTarget.addEventListener("mouseover", over);
		e2.currentTarget.addEventListener("mouseout", out);
		ansCounter--;
		exportRoot["confirmBtn"].alpha = 0;
	} else {
		e2.currentTarget.gotoAndStop(2); // Active Button click After Select
		e2.currentTarget.removeEventListener("mouseover", over);
		e2.currentTarget.removeEventListener("mouseout", out);
		ansCounter++;
		exportRoot["confirmBtn"].alpha = 1;
	}
	if (e2.currentTarget.qNum == currentQ) {
		var idNum = e2.currentTarget.id;
		l("currentQ: " + currentQ);
		l("idNum: " + idNum);
		if (e2.currentTarget.clicked) {
			exportRoot[`q${currentQ}_p${idNum}`].gotoAndStop(0);
		} else {
			exportRoot[`q${currentQ}_p${idNum}`].gotoAndStop(1);
		}
	}
	e2.currentTarget.clicked = !e2.currentTarget.clicked;
}

function hidePlaces() {
	for (var q = 1; q <= quizNum; q++) {
		for (var i = 1; i <= ansPerQ[q - 1]; i++) {
			exportRoot[`q${q}_p${i}`].alpha = 0;
		}
	}
}

function confirmFN() {
	exportRoot["confirmBtn"].alpha = 0;
	stopAllSounds();
	clickSd.play();

	if (ansCounter == ansPerQ[currentQ - 1]) {
		for (var i = 1; i <= ansPerQ[currentQ - 1]; i++) {
			exportRoot[`q${currentQ}_a${i}`].cursor = "auto";
			score++;
		}
	}

	if (score == ansPerQ[currentQ - 1]) {

		console.log("score " + score);

		goodSd.play();
		/* for (var i = 1; i <= ansPerQ[currentQ - 1]; i++) {
		  exportRoot[`q${currentQ}_p${i}`].gotoAndStop(1);
		} */
		exportRoot[`ans${currentQ}`].gotoAndStop(1);
		setTimeout(() => {
			hidePlaces();

			l("rightFB");
			boolV = true;
			exportRoot["rightFB"].playV = true;
			exportRoot["rightFB"].alpha = 1;
			exportRoot["rightFB"].gotoAndPlay(0);
		}, 3000);
	} else {
		attempts++;
		errorSd.play();
		hidePlaces();
		exportRoot["wrongFB"].playV = true;
		exportRoot["wrongFB"].alpha = 1;
		exportRoot["wrongFB"].gotoAndPlay(0);
		l("wrongFB");
		boolV = true;
	}
	finalScore++;
}

function nextQ() {
	l("nextQ");
	stopAllSounds();
	if (currentQ != quizNum) {
		l(currentQ);
		exportRoot.play();
		currentQ++;
		exportRoot["ans" + currentQ].gotoAndStop(0);
		resetFun();
		setTimeout(hideFB, 1000);
	}
}

function retryFN() {
	console.log("finalScore " + finalScore);
	l("retryFN");
	stopAllSounds();
	clickSd.play();
	exportRoot.gotoAndStop("quz" + currentQ);
	// currentQ = 1;
	exportRoot["ans" + currentQ].gotoAndStop(0);
	resetFun();
	hideFB();
}

function resetFun() {
	retryV = true;
	activateAnsFun();
	retryV = false;
	ansCounter = 0;
	score = 0;
}

function over(e) {
	e.currentTarget.gotoAndStop(1);
}

function over2(e) {
	e.currentTarget.gotoAndStop(2);
}

function out(e) {
	e.currentTarget.gotoAndStop(0);
}

// function showBtns() {
// 	if (finalScore == 9) {
// 		exportRoot["showAnsBtn"].alpha = 1;
// 	} else {
// 		exportRoot["retryBtn"].alpha = 1;
// 	}
// }

function exitFullscreen() {
	//toggle full screen
	var isInFullScreen =
		(document.fullscreenElement && document.fullscreenElement !== null) ||
		(document.webkitFullscreenElement &&
			document.webkitFullscreenElement !== null) ||
		(document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
		(document.msFullscreenElement && document.msFullscreenElement !== null);

	//var docElm = document.documentElement;
	/*if (!isInFullScreen) {
			if (docElm.requestFullscreen) {
				 docElm.requestFullscreen();
			} else if (docElm.mozRequestFullScreen) {
				 docElm.mozRequestFullScreen();
			} else if (docElm.webkitRequestFullScreen) {
				 docElm.webkitRequestFullScreen();
			} else if (docElm.msRequestFullscreen) {
				 docElm.msRequestFullscreen();
			}
	  } else {*/
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
	//}
}
/*========End=======*/
