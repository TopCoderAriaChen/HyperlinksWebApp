/*Page flipping plugin*/
const Webppt = (function () {
  const page = {
    loop: true, //Whether to flip and loop,
    indexAnimate: false, //Does the homepage support transition animations
    pageIndicator: true, //Do you want to add a page indicator
    pageIndicatorColor: [] //Indicator color value
  };
  /*Initialize parameters*/
  function init() {
    //PageCount 
    page._totalPage = $(".webppt-wrap .page").each(function (i, e) {
      //Add a unique identifier to each page and add a unique identifier to the slides below each page
      var pageid = "page-" + (i + 1);
      $(this).data('id', pageid).addClass(pageid).children(".slide").each(function (i2, e2) {
        var slideid = "page-" + (i + 1) + "-" + (i2 + 1);
        $(this).data('id', slideid).addClass(slideid);
      })
    }).length;
    page.$wrap = $(".webppt-wrap").addClass("perspective"); //Add css3d perspective
    var options = page.$wrap.data("options");
    if (options != undefined) {
      options = "{" + options + "}";
      options = JSON.parse(options)
      //options = eval("(" + options + ")");
      $.extend(page, options);
    }
    $(document).on("mousewheel DOMMouseScroll", function (event) {
      let delta;
      if (event.originalEvent.wheelDelta) {
        delta = event.originalEvent.wheelDelta / 120;
      } else if (event.originalEvent.detail) {
        delta = -event.originalEvent.detail / 3;
      }
      if (delta > 0) {
        if (now.row > 1) {
          page.down()
        }
      } else if (delta < 0) {
        page.up()
      }
    });

  }
  /*New Page*/
  var now = {
    row: 1,
    col: 1
  },
    /*last page*/
    last = {
      row: 0,
      col: 0
    };
  var towards = {
    up: 1,
    right: 2,
    down: 3,
    left: 4
  };
  //Is the animation in progress? Animation in progress cannot be switched
  var isAnimating = false;
  //v
  page.up = function () {
    if (isAnimating) return;
    last.row = now.row;
    last.col = now.col;
    if (last.row < page._totalPage) {
      now.row = last.row + 1;
      now.col = 1;
    } else if (page.loop) {
      now.row = 1;
      now.col = 1;
    }
    pageMove(towards.up, false);
  }
  //Switch pages
  page.switchPage = function (pageNo) {
    if (isAnimating) return;
    //
    if (pageNo >= 1 && pageNo <= page._totalPage) {
      last.row = now.row; //last page
      last.col = now.col;
      now.row = pageNo; //The current page is equal to the page to be switched
      now.col = 1;
      pageMove(towards.up, false);
    }

  }
  //Page Down
  page.down = function () {
    if (isAnimating) return;
    last.row = now.row;
    last.col = now.col;
    if (last.row > 1) {
      now.row = last.row - 1;
      now.col = 1;
    } else if (page.loop) {
      now.row = page._totalPage;
      now.col = 1;
    }
    pageMove(towards.down, false);
  }
  page.left = function () {
    if (isAnimating) return;
    last.row = now.row;
    last.col = now.col;
    var pageSlides = $(getPageSlidesSelector(last)).length;
    if (last.row >= 1 && last.row <= page._totalPage && pageSlides > 1) {
      now.row = last.row;
      if (last.col < pageSlides) {
        now.col = last.col + 1;
      } else if (page.loop) {
        now.col = 1;
      }
      pageMove(towards.left, false);
    }
  }
  page.leftUp = function () {
    if (isAnimating) return;
    last.row = now.row, last.col = now.col;
    var t = $(getPageSlidesSelector(last)).length;
    last.row >= 1 && last.row <= page._totalPage && t > 1 ? (now.row = last.row, last.col < t ? (now
      .col =
      last.col + 1, pageMove(towards.left, !1)) : page.up()) : page.up()
  }
  page.right = function () {
    if (isAnimating) return;
    last.row = now.row;
    last.col = now.col;
    var pageSlides = $(getPageSlidesSelector(last)).length;
    if (last.row >= 1 && last.row <= page._totalPage && pageSlides > 1) {
      now.row = last.row;
      if (last.col > 1) {
        now.col = last.col - 1;
      } else if (page.loop) {
        now.col = pageSlides;
      }
      pageMove(towards.right, false);
    }
  }
  page.switchSlide = function (no) {
    if (isAnimating) return;
    last.row = now.row;
    last.col = now.col;
    now.col = no;
    now.row = last.row;
    pageMove(towards.left, false);

  }

  //start
  function start(options) {
    init();
    if (options != undefined && typeof (options) == "object") {
      $.extend(page, options);
    }
    //Start initialization
      pageMove(towards.up, true);
      //Generate Page Indicator
      buildPageIndicator();
    return page;
  }

  function getPageSelector(page, notslide) { // Notslide indicates not including sub slides
    page = page || now;
    if (notslide) {
      return ".page-" + page.row;
    }
    //
    if (last.row == now.row && last.col != now.col) {
      return ".page-" + page.row + "-" + page.col;
    }
    return ".page-" + page.row;
  }

  function getLastPageSelector() { // Get Previous Page	
    //
    if (last.row == now.row && last.col != now.col) {
      return ".page-" + last.row + "-" + last.col;
    } else if (last.row != now.row && last.col > 1) {
      return `.page-${last.row}-${last.col},.page-${last.row}`;
    }
    return ".page-" + last.row;
  }

  function getPageSlidesSelector(page, notslide) {
    return getPageSelector(page, notslide) + " .slide";
  }

  function getPageSlideIndicatorID(page, num) {
    return "slide-indicator-" + page.row + "-" + num;
  }

  function getPageIndicatorID(page, num) {
    return "page-indicator-" + num;
  }
  //Animation end event name
  var animEndEventName = (function animationEnd() {
    var body = document.body || document.documentElement;
    var animEndEventNames = {
      animation: 'animationend',
      WebkitAnimation: 'webkitAnimationEnd'
    }
    for (var name in animEndEventNames) {
      if (typeof body.style[name] === "string") {
        return animEndEventNames[name]
      }
    }
  })();
  //Get random safe colors
  function getRandomSafeColor() {
    var base = ['00', '33', '66', '99', 'CC', 'FF']; //Basic color code
    var len = base.length; //Basic color length
    var bg = new Array(); //The returned result
    var random = Math.ceil(Math.random() * 215 + 1); //Obtain a random number between 1 and 216
    var res;
    for (var r = 0; r < len; r++) {
      for (var g = 0; g < len; g++) {
        for (var b = 0; b < len; b++) {
          bg.push('#' + base[r].toString() + base[g].toString() + base[b].toString());
        }
      };
    };
    res = bg[random];
    return res;
  }
  //Generate Page Indicator
  function buildPageIndicator() {
    //Add page indicator
    if (page.pageIndicator) {
      var $ul = $('<ul class="page-indicator"></ul>').appendTo(".webppt-wrap");
      for (var i = 0; i < page._totalPage; i++) {
        var $li = $('<li><span></span></li>').data("id", i + 1)
          .attr("id", getPageIndicatorID(now, i + 1)).css("background", page.pageIndicatorColor[i] ||
            getRandomSafeColor())
          .appendTo($ul).on("click", function () {
            page.switchPage($(this).data("id"));
          });
        if (i == 0) {
          $li.addClass("on")
        }
      }
    }
  }
  //Page switching
  function pageMove(tw, start) { //Start means starting the first one
    var lastPage = getLastPageSelector(),
      nowPage = getPageSelector(now),
      $lastPage = $(lastPage),
      $nowPage = $(nowPage),
      nowPageAnimEnd = false, //The current page animation ends
      lastPageAnimEnd = false; //End of previous animation page
    //If it is the current page, do not switch
    if ($lastPage.data("id") == $nowPage.data("id")) {
      return;
    }
    //Current page display
    $nowPage.addClass("show threeD perspective"); //.find(".hide").removeClass("hide");
    //Display the first slide below the current page
    $nowPage.children(".slide").first().addClass("show");
    //Add an indicator bar to the current slide when flipping up and down
    var pageSlides = $(getPageSlidesSelector(now, true)).length;
    if (pageSlides > 1) {
      if (tw == towards.up || tw == towards.down) {
        if ($nowPage.children(".slide-indicator").length <= 0) { //Create without indicator
          var $ul = $('<ul class="slide-indicator"></ul>').attr("id", "slide-indicator-" + now.row)
            .appendTo($nowPage);
          for (var i = 0; i < pageSlides; i++) {
            var $li = $('<li></li>').data("id", i + 1)
              .attr("id", getPageSlideIndicatorID(now, i + 1))
              .appendTo($ul).on("click", function () {
                page.switchSlide($(this).data("id"));
              });
            if (i == 0) {
              $li.addClass("on")
            }
          }
        } else {
          //The first display style
          $("#slide-indicator-" + now.row + " li").removeClass("on").first().addClass("on");
        }
      } else if (tw == towards.left || tw == towards.right) {
        $("#slide-indicator-" + now.row + " li").removeClass("on");
        $("#slide-indicator-" + now.row + "-" + now.col).addClass("on");
      }
    }
    //Change page indicator when flipping pages 
    if (page.pageIndicator) {
      $(".page-indicator li").removeClass("on");
      $("#page-indicator-" + now.row).addClass("on");
    }
    //If it is the startup screen (), do not add transition effects to the first screen
    if (start && !page.indexAnimate) {
      return;
    }
    var animationClassObj = page.getAnimationClass($nowPage.data("animation")); //获取当前页的动画类型
    var outClass = animationClassObj.outClass;
    var inClass = animationClassObj.inClass;
    //Indicates that the animation is running
    isAnimating = true;
    //Previous page exit effect
    $lastPage.addClass(outClass).on(animEndEventName, function () {
      $lastPage.off(animEndEventName);
      $lastPage.removeClass(outClass).removeClass("perspective threeD show");
      //$lastPage.addClass("hide");
      lastPageAnimEnd = true; //End of previous animation page
      if (nowPageAnimEnd) {
        isAnimating = false;
      }
    });
    //Current page display effect
    $nowPage.addClass(inClass).on(animEndEventName, function () {
      $nowPage.off(animEndEventName);
      $(nowPage).addClass("show perspective threeD");
      //$(nowPage).removeClass("hide"); 
      $(nowPage).removeClass(inClass);
      nowPageAnimEnd = true; //The current page animation ends
      if (lastPageAnimEnd) {
        isAnimating = false;
      }
    });

  }
  page.getAnimationClass = function getAnimationClass(animationType) {
    var animationClassList = page.getAnimationClassList();
    if (animationType && animationType <= animationClassList.length && animationType >= 1) {
      animationType = animationType - 1;
    } else {
      animationType = parseInt(Math.random() * animationClassList.length, 10);
    }
    return animationClassList[animationType];
  }
  /**
   * Get page transition animation style
   * @param {Object} animationType Animation type, numbers, 1-67
   */
  page.getAnimationClassList = function () {
    var animationClassList = [{
      outClass: 'pt-page-moveToLeft',
      inClass: 'pt-page-moveFromRight'
    },
    {
      outClass: 'pt-page-moveToRight',
      inClass: 'pt-page-moveFromLeft'
    },
    {
      outClass: 'pt-page-moveToTop',
      inClass: 'pt-page-moveFromBottom'
    },
    {
      outClass: 'pt-page-moveToBottom',
      inClass: 'pt-page-moveFromTop'
    },
    {
      outClass: 'pt-page-fade',
      inClass: 'pt-page-moveFromRight pt-page-ontop'
    },
    {
      outClass: 'pt-page-fade',
      inClass: 'pt-page-moveFromLeft pt-page-ontop'
    },
    {
      outClass: 'pt-page-fade',
      inClass: 'pt-page-moveFromBottom pt-page-ontop'
    },
    {
      outClass: 'pt-page-fade',
      inClass: 'pt-page-moveFromTop pt-page-ontop'
    },
    {
      outClass: 'pt-page-moveToLeftFade',
      inClass: 'pt-page-moveFromRightFade'
    },
    {
      outClass: 'pt-page-moveToRightFade',
      inClass: 'pt-page-moveFromLeftFade'
    },
    {
      outClass: 'pt-page-moveToTopFade',
      inClass: 'pt-page-moveFromBottomFade'
    },
    {
      outClass: 'pt-page-moveToBottomFade',
      inClass: 'pt-page-moveFromTopFade'
    },
    {
      outClass: 'pt-page-moveToLeftEasing pt-page-ontop',
      inClass: 'pt-page-moveFromRight'
    },
    {
      outClass: 'pt-page-moveToRightEasing pt-page-ontop',
      inClass: 'pt-page-moveFromLeft'
    },
    {
      outClass: 'pt-page-moveToTopEasing pt-page-ontop',
      inClass: 'pt-page-moveFromBottom'
    },
    {
      outClass: 'pt-page-moveToBottomEasing pt-page-ontop',
      inClass: 'pt-page-moveFromTop'
    },
    {
      outClass: 'pt-page-scaleDown',
      inClass: 'pt-page-moveFromRight pt-page-ontop'
    },
    {
      outClass: 'pt-page-scaleDown',
      inClass: 'pt-page-moveFromLeft pt-page-ontop'
    },
    {
      outClass: 'pt-page-scaleDown',
      inClass: 'pt-page-moveFromBottom pt-page-ontop'
    },
    {
      outClass: 'pt-page-scaleDown',
      inClass: 'pt-page-moveFromTop pt-page-ontop'
    },
    {
      outClass: 'pt-page-scaleDown',
      inClass: 'pt-page-scaleUpDown pt-page-delay300'
    },
    {
      outClass: 'pt-page-scaleDownUp',
      inClass: 'pt-page-scaleUp pt-page-delay300'
    },
    {
      outClass: 'pt-page-moveToLeft pt-page-ontop',
      inClass: 'pt-page-scaleUp'
    },
    {
      outClass: 'pt-page-moveToRight pt-page-ontop',
      inClass: 'pt-page-scaleUp'
    },
    {
      outClass: 'pt-page-moveToTop pt-page-ontop',
      inClass: 'pt-page-scaleUp'
    },
    {
      outClass: 'pt-page-moveToBottom pt-page-ontop',
      inClass: 'pt-page-scaleUp'
    },
    {
      outClass: 'pt-page-scaleDownCenter',
      inClass: 'pt-page-scaleUpCenter pt-page-delay400'
    },
    {
      outClass: 'pt-page-rotateRightSideFirst',
      inClass: 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop'
    },
    {
      outClass: 'pt-page-rotateLeftSideFirst',
      inClass: 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop'
    },
    {
      outClass: 'pt-page-rotateTopSideFirst',
      inClass: 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop'
    },
    {
      outClass: 'pt-page-rotateBottomSideFirst',
      inClass: 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop'
    },
    { //2
      outClass: 'pt-page-flipOutRight',
      inClass: 'pt-page-flipInLeft pt-page-delay500'
    },
    {
      outClass: 'pt-page-flipOutLeft',
      inClass: 'pt-page-flipInRight pt-page-delay500'
    },
    {
      outClass: 'pt-page-flipOutTop',
      inClass: 'pt-page-flipInBottom pt-page-delay500'
    },
    {
      outClass: 'pt-page-flipOutBottom',
      inClass: 'pt-page-flipInTop pt-page-delay500'
    },
    {
      outClass: 'pt-page-rotateFall pt-page-ontop',
      inClass: 'pt-page-scaleUp'
    },
    {
      outClass: 'pt-page-rotateOutNewspaper',
      inClass: 'pt-page-rotateInNewspaper pt-page-delay500'
    },
    {
      outClass: 'pt-page-rotatePushLeft',
      inClass: 'pt-page-moveFromRight'
    },
    {
      outClass: 'pt-page-rotatePushRight',
      inClass: 'pt-page-moveFromLeft'
    },
    {
      outClass: 'pt-page-rotatePushTop',
      inClass: 'pt-page-moveFromBottom'
    },
    {
      outClass: 'pt-page-rotatePushBottom',
      inClass: 'pt-page-moveFromTop'
    },
    {
      outClass: 'pt-page-rotatePushLeft',
      inClass: 'pt-page-rotatePullRight pt-page-delay180'
    },
    {
      outClass: 'pt-page-rotatePushRight',
      inClass: 'pt-page-rotatePullLeft pt-page-delay180'
    },
    {
      outClass: 'pt-page-rotatePushTop',
      inClass: 'pt-page-rotatePullBottom pt-page-delay180'
    },
    {
      outClass: 'pt-page-rotatePushBottom',
      inClass: 'pt-page-rotatePullTop pt-page-delay180'
    },
    {
      outClass: 'pt-page-rotateFoldLeft',
      inClass: 'pt-page-moveFromRightFade'
    },
    {
      outClass: 'pt-page-rotateFoldRight',
      inClass: 'pt-page-moveFromLeftFade'
    },
    {
      outClass: 'pt-page-rotateFoldTop',
      inClass: 'pt-page-moveFromBottomFade'
    },
    {
      outClass: 'pt-page-rotateFoldBottom',
      inClass: 'pt-page-moveFromTopFade'
    },
    {
      outClass: 'pt-page-moveToRightFade',
      inClass: 'pt-page-rotateUnfoldLeft'
    },
    {
      outClass: 'pt-page-moveToLeftFade',
      inClass: 'pt-page-rotateUnfoldRight'
    },
    {
      outClass: 'pt-page-moveToBottomFade',
      inClass: 'pt-page-rotateUnfoldTop'
    },
    {
      outClass: 'pt-page-moveToTopFade',
      inClass: 'pt-page-rotateUnfoldBottom'
    },
    {
      outClass: 'pt-page-rotateRoomLeftOut pt-page-ontop',
      inClass: 'pt-page-rotateRoomLeftIn'
    },
    {
      outClass: 'pt-page-rotateRoomRightOut pt-page-ontop',
      inClass: 'pt-page-rotateRoomRightIn'
    },
    {
      outClass: 'pt-page-rotateRoomTopOut pt-page-ontop',
      inClass: 'pt-page-rotateRoomTopIn'
    },
    {
      outClass: 'pt-page-rotateRoomBottomOut pt-page-ontop',
      inClass: 'pt-page-rotateRoomBottomIn'
    },
    {
      outClass: 'pt-page-rotateCubeLeftOut pt-page-ontop',
      inClass: 'pt-page-rotateCubeLeftIn'
    },
    {
      outClass: 'pt-page-rotateCubeRightOut pt-page-ontop',
      inClass: 'pt-page-rotateCubeRightIn'
    },
    {
      outClass: 'pt-page-rotateCubeTopOut pt-page-ontop',
      inClass: 'pt-page-rotateCubeTopIn'
    },
    {
      outClass: 'pt-page-rotateCubeBottomOut pt-page-ontop',
      inClass: 'pt-page-rotateCubeBottomIn'
    },
    {
      outClass: 'pt-page-rotateCarouselLeftOut pt-page-ontop',
      inClass: 'pt-page-rotateCarouselLeftIn'
    },
    {
      outClass: 'pt-page-rotateCarouselRightOut pt-page-ontop',
      inClass: 'pt-page-rotateCarouselRightIn'
    },
    {
      outClass: 'pt-page-rotateCarouselTopOut pt-page-ontop',
      inClass: 'pt-page-rotateCarouselTopIn'
    },
    {
      outClass: 'pt-page-rotateCarouselBottomOut pt-page-ontop',
      inClass: 'pt-page-rotateCarouselBottomIn'
    },
    {
      outClass: 'pt-page-rotateSidesOut',
      inClass: 'pt-page-rotateSidesIn pt-page-delay500'
    },
    {
      outClass: 'pt-page-rotateSlideOut',
      inClass: 'pt-page-rotateSlideIn'
    }
    ];
    return animationClassList;
  };
  page.start = start;
  return page;
})();

Webppt.start()

function picturePreview(el) {
  $('.dialog').html(`
    <img src="${$(el).attr('src')}" style="width: 50%;" alt="">
  `).css('display', 'flex')
}

function closePreview() {
  $('.dialog').css('display', 'none')
}