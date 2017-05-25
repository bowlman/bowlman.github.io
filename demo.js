/* jshint loopfunc: true */

(function () {
    "use strict";

    // Init flash bulb sound

    var sources = [
        { 'type': 'audio/ogg',  'ext': 'ogg' },
        { 'type': 'audio/mpeg', 'ext': 'mp3' },
        { 'type': 'audio/wav',  'ext': 'wav' },
        { 'type': 'audio/aac',  'ext': 'aac' }
    ], 
	source,
	sound = new Audio(),
	processing = false;

    // jQuery Stuff

    $(function() {
        var $video = $('#demo-video'),
            $img   = $('#demo-img');

	var $g_faces;

	var xscale_def=1.5;
	var yscale_def=0.9;
	var xmarg_def=10;
	var ymarg_def=10;
	var faceoff_def=0.6;

	// init sliders and text fields
	createSlider($( "#slider-xscale" ), $( "#amount1" ), 0, 5, xscale_def, 0.1);
	createSlider($( "#slider-yscale" ), $( "#amount2" ), 0, 5, yscale_def, 0.1);
	createSlider($( "#slider-xmarg" ), $( "#amount3" ), -100, 100, xmarg_def, 1);    
	createSlider($( "#slider-ymarg" ), $( "#amount4" ), -100, 100, ymarg_def,1);    
	createSlider($( "#slider-faceoff" ), $( "#amount5" ), 0, 1, faceoff_def,0.02);


	var $xscale=xscale_def;
	var $yscale=yscale_def;
	var $xmarg=xmarg_def;
	var $ymarg=ymarg_def;
	var $faceoff=faceoff_def;

        // Flash flash bulb

        function flash() {
            $('<div />', {
                'class': 'flash'
            })
		.appendTo('body')
		.fadeOut('fast', function() {
                    $(this).remove();
		});

            sound.play();
        }

	// File uploading
	$(document).on('change', 'input', function() {
	    console.log("running onload...");
	    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
	    var reader  = new FileReader();

	    reader.onloadend = function () {
		console.log("loading ended:", reader.result);
		$img.attr("src", reader.result);

	    }

	    if (file) {
		console.log("file not null");
		reader.readAsDataURL(file); //reads the data as a URL
	    } else {
		console.log("file null");
		$img.attr("src", "");
	    }	    
        });
	


        // Demo
        // Detect faces in Pictures

        $('.do-img-detect').click(function(e) {
            e.preventDefault();

            if (processing) {
                return false;
            }

            processing = true;

            initFaces();

            $('.spinner').css('opacity', 1);

            $img.faceDetection({
                interval: 4,
                async: true,
                complete: function(faces) {
                    completed(faces);
                    flash();

                    processing = false;

                    $('.spinner').css('opacity', 0);
                    $('body').addClass('processed');
                },
                error:function(code, message) {
                    alert('Error: ' + message);
                }
            });
        });

        function initFaces() {
            $('.portrait, .face-img').remove();

            $('.demo-click').removeClass('animated flipInX');

            $('body').removeClass('processed');
        }

        function completed(faces) {
	    $g_faces=faces;
            var marg = 0;

            for (var i = 0; i < faces.length; i++) {
                var left   = (faces[i].x - $xmarg),
                    top    = (faces[i].y - $ymarg - faces[i].height*0.4),
                    width  = (faces[i].width*$xscale  + (marg * 2)),
                    height = (faces[i].height*$yscale + (marg *2));

                $('<img />', {
                    'class': 'face-img',
		    'src': 'bowl.png',
                    'css': {
                        'left':   left   * faces[i].scaleX + 'px',
                        'top':    top    * faces[i].scaleY + 'px',
                        'width':  width  * faces[i].scaleX + 'px',
                        'height': height * faces[i].scaleY + 'px'
                    }
                })
                    .appendTo($img.closest('div'));

                var $div = $('<div />', {
                    'class': 'portrait',
                    'css': {
                        'background-image': 'url(' + $img.attr('src') + ')',
                        'background-position': -left + 'px ' + -top + 'px'
                    }
                }).on('click', function(e) {
                    e.preventDefault();

                    $('.portrait').fadeOut('fast', function() {
                        $(this).remove();

                        initFaces();
                    });
                }).appendTo('#portraits');

                (function($div, i) {
                    setTimeout(function() {
                        $div.addClass('animated swing');
                    }, 100 * i);
                })($div, i);
            }
        }

        // Demo
        // Detect faces in Video

        $('.do-video-detect').click(function(e) {
            e.preventDefault();
            
            $('.face-video').remove();

            if ($video[0].paused) {
                $video[0].play();
            }
            
            setTimeout(function() {
                $video[0].pause();

                $video.faceDetection({
                    interval: 1,
                    async: true,
                    complete: function(faces) {
                        flash();
                        
                        $('<div>', {
                            'class':'face-video',
                            'css': {
                                'left':   faces[0].x * faces[0].scaleX + 'px',
                                'top':    faces[0].y * faces[0].scaleY + 'px',
                                'width':  faces[0].width  * faces[0].scaleX + 'px',
                                'height': faces[0].height * faces[0].scaleY + 'px'
                            }
                        })
                            .insertAfter(this);
                    }
                });
            }, 500);
        });

        // Video controls

        $('#play-video').on('click', function () {
            $video[0].play(); 
        });

        $video.on('play', function () {
            $('#play-video').hide();
            $('.face-video').remove();
        }).on('pause', function () {
            $('#play-video:hidden').show();
        });


	function updateBowls() {
	    console.log("updating bowls");
	    if ($g_faces) {
		$xscale=$("#slider-xscale").slider("value");
		$yscale=$("#slider-yscale").slider("value");
		$xmarg=$("#slider-xmarg").slider("value");
		$ymarg=$("#slider-ymarg").slider("value");	
		$faceoff=$("#slider-faceoff").slider("value");	
		var marg=0;
		$('.face-img').each(function(i, div){
		    console.log(i)
		    var left   = ($g_faces[i].x - $xmarg);
		    var top    = ($g_faces[i].y - $ymarg - $g_faces[i].height*$faceoff);
		    var width  = ($g_faces[i].width*$xscale);
		    var height = ($g_faces[i].height*$yscale);

                    $(div).css('left',   left   * $g_faces[i].scaleX);
                    $(div).css('top',   top    * $g_faces[i].scaleY);
                    $(div).css('width',  width  * $g_faces[i].scaleX);
		    $(div).css('height', height * $g_faces[i].scaleY);
		});
	    }	 
	}


	function createSlider(slider, boundTextField, xmin,xmax,def, step) {
	    boundTextField.val( def );
	    slider.slider({
		orientation: "vertical",
		range: "min",
		min: xmin,
		max: xmax,
		value: def,
		step: step,
		slide: function( event, ui ) {
		    boundTextField.val( ui.value );
		    updateBowls()
		}
	    })
	}
    });
})();
