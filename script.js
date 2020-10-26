document.addEventListener('DOMContentLoaded', () => {

    // Retrieving the document elements that will need modifying
    let shape = document.querySelector('.circle');
    let upperText = document.querySelector('.header');
    let lowerText = document.querySelector('.footer');

    // Initialising audio context
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    let oscSaw = ctx.createOscillator();    // Synth
    let oscSaw2 = ctx.createOscillator()    // second synth
    let gainSaw = ctx.createGain();         // Gain node
    let oscSawPan = ctx.createStereoPanner(); // Left synth
    let oscSaw2Pan= ctx.createStereoPanner(); // Right synth
    let panNode = ctx.createStereoPanner(); // Main stereo panner node
    let filter = ctx.createBiquadFilter();  // low-pass filter

    // Retrieving document dimensions
    let docElem = document.documentElement;
    let body = document.getElementsByTagName('body')[0];
    let width = docElem.clientWidth || body.clientWidth;
    let height = docElem.clientHeight|| body.clientHeight;

    let gScaleFactor = 0.7;   // Baseline scale of the circle
    let scaleFactor = 0.7;      // Used for changing the scaling of the circle
    let x = 0.5; // horizontal coordinate
    let y = 0.5; // vertical coordinate
    let withinBounds = false; // Checks whether the cursor is within the circle
    let clickOccurred = false; // Checks whether the initial click occurred
    let counter = 0;          // Variable to animate the circle
    let color = "paleturquoise";

    // Setting up base values for synth and filter
    oscSaw.type = "sawtooth";
    oscSaw2.type = "sawtooth";
    oscSaw.frequency.value = 150;
    oscSaw2.frequency.value = 150;
    gainSaw.gain.value = 0;
    filter.frequency.value = 500;
    filter.Q.value = 3;
    filter.type.value = "lowpass";
    oscSawPan.pan.value = -1; // Left synth
    oscSaw2Pan.pan.value = 1; // Left  synth

    // Connecting nodes (leaving osc disconnected to play/pause sound later
    oscSaw.connect(oscSawPan);
    oscSaw2.connect(oscSaw2Pan);
    oscSawPan.connect(gainSaw); // Left synth
    oscSaw2Pan.connect(gainSaw);
    gainSaw.connect(filter);
    filter.connect(panNode);
    panNode.connect(ctx.destination);

    // Start oscillator
    oscSaw.start();
    oscSaw2.start();

    // Initial scaling for the circle
    updateDimensions();

    // Rescale circle whenever window is resized
    window.addEventListener("resize", updateDimensions);

    // This will update the synth parameters everytime the cursor moves.
    document.addEventListener('mousemove', updateSynth);

    // Run only once after initial click
    shape.addEventListener("click", clickFunction);

    // Play sound when the cursor moves over the circle
    shape.addEventListener("mouseenter", () => {

        //panNode.connect(ctx.destination);
        withinBounds = true;

    })

    // Stop sound when the cursor leaves the circle
    shape.addEventListener("mouseleave", () => {
        withinBounds = false;
        oscSaw.detune.value = 0;
        oscSaw2.detune.value = 0;
        setInterval(turnoffVolume,10);
    })

    // create a particle every 100 ms
    setInterval(createParticle, 50);

    //###############################//
    //########  FUNCTIONS   #########//
    //###############################//
    function turnoffVolume(){
        if (withinBounds === false) {
            gainSaw.gain.value /= 2;
        }
    }

    // This is the function that will run once after the initial click.
    // It changes the color of various elements, resumes the audio context,
    // updates the synth parameters, then destroys the event listener.
    function clickFunction(event){
        // Update colours
        color = "#EF5700";
        shape.style.borderColor = color;
        lowerText.style.color = color;
        upperText.style.color = "transparent";
        document.body.style.background = "#EACEFF";
        // Resume audio context
        ctx.resume();
        // Update synth
        updateSynth(event);
        // Start playing sound
        oscSaw.connect(gainSaw);
        oscSaw2.connect(gainSaw)
        // Remove event listener
        shape.removeEventListener("click", clickFunction, false);
        clickOccurred = true;
    }

    function updateSynth(event) {
        if (withinBounds === true) {
            x = event.offsetX/shape.clientWidth;    // Get the horizontal coordinate
            y = event.offsetY/shape.clientHeight;   // Get the vertical coordinate

            // vertical position controls frequency
            oscSaw.frequency.value = 80+220*(1-y);
            oscSaw2.frequency.value = 80+220*(1-y);
            // horizontal position controls panning
            panNode.pan.setValueAtTime(0.9*(2*x-1), ctx.currentTime);
            if (clickOccurred === true) {
                if (oscSaw.detune.value < 100) {
                    oscSaw.detune.setValueAtTime(oscSaw.detune.value+0.1, ctx.currentTime);
                    oscSaw2.detune.setValueAtTime(-oscSaw.detune.value, ctx.currentTime);
                }
                if (gainSaw.gain.value<0.7)
                {
                    gainSaw.gain.value += 0.01;
                }
                counter +=0.01;
                scaleFactor = gScaleFactor + 0.05*Math.sin(counter);
                updateDimensions();
            }
        }
    }

    // Function to update scaling of the elements
    function updateDimensions() {
        width = docElem.clientWidth || body.clientWidth;
        height = docElem.clientHeight|| body.clientHeight;
        let dim;
        if (width<height) {
            dim =  scaleFactor*width;
        }
        else {
            dim =  scaleFactor*height;
        }
        shape.style.width = dim  +'px';
        shape.style.height = dim +'px';
    }

    function createParticle(){
        let particle = document.createElement('particle');

        // dimensions of the particle
        let size = Math.random() * 20;
        particle.style.width = 2 + size + 'px';
        particle.style.height = 2 + size + 'px';

        // position of the particle
        let posX = Math.random() * width
        let posY = Math.random() * height
        particle.style.left = posX + 'px';
        particle.style.top = posY + 'px';

        particle.style.setProperty('--movX', 2*(posX-width/2) + "%")
        particle.style.setProperty('--movY', 2*(posY-width/2) + "%")

        // color of the particle
        particle.style.background = color;

        // appendChild is a method to append an item in a list.
        // Here, an item "particle" is added to the element 'body'
        body.appendChild(particle);

        // remove particle after 5s
        setTimeout(() => {
            particle.remove()
        },7500)
    }
})