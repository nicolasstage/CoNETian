import React, { useRef, useEffect, useState } from 'react';
import { levels } from '../../shared/gameParams';
// import { Tap, BackgroundAudio, ConetianDeath } from '../../shared/assets';
import { playAudio, stopAudio } from '../../shared/functions';
import { useAudioPlayer } from 'react-use-audio-player';

import { useConetianHighFire, useConetianMediumFire } from '../../hooks/useConetianHooks';
import { groundImage, backgroundImage, pipeBottomImg, pipeTopImg, } from '../../shared/assets';
import { useGameContext } from '../../utilitiy/providers/GameProvider';
import { fetchTicketResult } from '@/API/getData';

type Props = {
  setGameStatus: (e: number) => void,
  gameStatus: number,
  setScores: (score: number) => void,
  setRoulette: (event: boolean) => void,
}

const Game: React.FC<Props> = ({ setGameStatus, gameStatus, setScores, setRoulette }) => {

  const { load } = useAudioPlayer();

  const { setGames, games, audio, gameDifficulty, profile } = useGameContext();

  let gameSpeed = gameDifficulty === 2 || gameDifficulty === 1 ? levels.speedLevel1 : levels.speedLevel3;
  let gameFrame = gameDifficulty === 2 || gameDifficulty === 1 ? levels.frameLevel1 : levels.frameLevel3;

  const conetianHighFireImage = useConetianHighFire();
  const conetianMediumFireImage = useConetianMediumFire();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState<number>(0);
  const backAudioRef = useRef<HTMLAudioElement | null>(null);

  let gravity = 0.6;
  let bird = { x: 30, y: 70, width: 50, height: 50, dy: 0 };
  let pipes: { x: number, y: number, width: number, height: number, isTop: boolean, passed: boolean }[] = [];
  let frame = 0;
  let flyBird = 0;
  let flagScore = 0;

  // useEffect(() => {
  //   if (audio)
  //     playAudio(backAudioRef);
  // }, [audio])

  useEffect(() => {
    if (gameStatus === 1) {
      stopAudio(backAudioRef);
    }

    if (gameStatus === 2) {
      gameSpeed = 0;
      gravity = 0;
      bird = games.bird;
      pipes = games.pipes;
      frame = games.frame;
      bird.dy = 0;
      flagScore = games.score;
    }

    if (gameStatus === 3) {
      playAudio(backAudioRef);
      gameSpeed = games.gameSpeed;
      gravity = 0.6;
      bird = games.bird;
      pipes = games.pipes;
      frame = games.frame;
      flagScore = games.score;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const birdImage = new Image();
    birdImage.src = conetianHighFireImage.src;

    const birdFlyImg = new Image();
    birdFlyImg.src = conetianMediumFireImage.src;

    const pipeTopImage = new Image();
    pipeTopImage.src = pipeTopImg.src;

    const pipeBottomImage = new Image();
    pipeBottomImage.src = pipeBottomImg.src;

    const backgroundImageObj = new Image();
    backgroundImageObj.src = backgroundImage.src;

    const groundImageObj = new Image();
    groundImageObj.src = groundImage.src;

    backgroundImageObj.onload = () => {
      background.width = backgroundImageObj.width;
      background.height = canvas.height;
      background.x2 = background.width;
    };

    const birdCanvas = document.createElement('canvas');
    birdCanvas.width = bird.width;
    birdCanvas.height = bird.height;
    const birdContext = birdCanvas.getContext('2d')!;
    birdImage.onload = () => {
      birdContext.drawImage(birdImage, 0, 0, bird.width, bird.height);
    };

    const addPipe = () => {
      const pipeWidth = 60;
      const minPipeHeight = 50; // Minimum height to avoid overly short pipes
      const maxPipeHeight = canvas.height - 350; // Maximum height to avoid overly long pipes
      const pipeHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight; // Restricting pipe height range
      const gap = 200; // Gap between the pipes

      pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: pipeHeight,
        isTop: true,
        passed: false,
      });

      pipes.push({
        x: canvas.width,
        y: pipeHeight + gap,
        width: pipeWidth,
        height: Math.max(minPipeHeight, canvas.height - pipeHeight - gap), // Ensuring bottom pipe height is also within limits
        isTop: false,
        passed: false,
      });
    };

    const drawBackground = () => {
      context.drawImage(backgroundImageObj, background.x1, 0, backgroundImageObj.width, canvas.height);
      context.drawImage(backgroundImageObj, background.x2, 0, backgroundImageObj.width, canvas.height);
    };

    const moveBackground = () => {
      background.x1 -= background.speed;
      background.x2 -= background.speed;

      // Adjust the position if background.x1 moves off-screen
      if (background.x1 <= -backgroundImageObj.width) {
        background.x1 = background.x2 + backgroundImageObj.width;
      }

      // Adjust the position if background.x2 moves off-screen
      if (background.x2 <= -backgroundImageObj.width) {
        background.x2 = background.x1 + backgroundImageObj.width;
      }

      // Make sure there's no initial gap by aligning the second image correctly
      if (background.x1 >= 0 && background.x2 >= backgroundImageObj.width) {
        background.x2 = background.x1 + backgroundImageObj.width;
      }
      if (background.x2 >= 0 && background.x1 >= backgroundImageObj.width) {
        background.x1 = background.x2 + backgroundImageObj.width;
      }
    };

    // Initializing background positions
    let background = {
      x1: 0,
      x2: backgroundImageObj.width,
      y: 0,
      width: backgroundImageObj.width,
      height: canvas.height,
      speed: gameSpeed
    };

    const drawBird = () => {
      const centerX = bird.x + bird.width / 2;
      const centerY = bird.y + bird.height / 2;
      const radius = bird.width / 2;

      context.save();
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.closePath();
      context.clip();

      if (flyBird % 2 === 0)
        context.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
      else
        context.drawImage(birdFlyImg, bird.x, bird.y, bird.width, bird.height);
      context.restore();
    };

    const drawPipes = () => {
      pipes.forEach(pipe => {
        const pipeImage = pipe.isTop ? pipeTopImage : pipeBottomImage;
        context.drawImage(pipeImage, pipe.x, pipe.y, pipe.width, pipe.height);
      });
    };

    const checkPixelCollision = (birdContext: CanvasRenderingContext2D, pipe: { x: number, y: number, width: number, height: number }) => {
      const birdImageData = birdContext.getImageData(0, 0, bird.width, bird.height);
      const birdPixels = birdImageData.data;

      for (let y = 0; y < bird.height; y++) {
        for (let x = 0; x < bird.width; x++) {
          const birdPixelIndex = (y * bird.width + x) * 4;
          const birdAlpha = birdPixels[birdPixelIndex + 3];

          if (birdAlpha > 0) {
            const birdPixelX = bird.x + x;
            const birdPixelY = bird.y + y;

            if (
              birdPixelX >= pipe.x &&
              birdPixelX <= pipe.x + pipe.width &&
              birdPixelY >= pipe.y &&
              birdPixelY <= pipe.y + pipe.height
            ) {
              return true;
            }
          }
        }
      }

      return false;
    };

    const update = () => {
      if (gameStatus === 1) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      drawBackground();

      bird.dy += gravity;
      bird.y += bird.dy;
      if (bird.y + bird.height > window.innerHeight || bird.y < 0) {
        // if (audio)
        //   load(ConetianDeath, {
        //     autoplay: true,
        //   })
        setGameStatus(1);
        return;
      }

      pipes.forEach(pipe => {
        pipe.x -= gameSpeed;
        if (!pipe.passed && pipe.isTop && pipe.x + pipe.width < bird.x) {
          flagScore++;
          if (flagScore === 10 && gameDifficulty === 2) {
            gameSpeed = levels.speedLevel2;
            gameFrame = levels.frameLevel2;
          }
          if (flagScore === 30 && gameDifficulty === 2) {
            gameSpeed = levels.speedLevel3;
            gameFrame = levels.frameLevel3;
          }
          setScore(score => score + 1);

          if (flagScore % 5 === 0 && flagScore >= 1 && profile?.keyID) {
            if (Math.random() < 0.3) {
              fetchTicketResult(profile?.keyID);
            }
          }
          pipe.passed = true;
        }
        if (checkPixelCollision(birdContext, pipe)) {
          // if (audio)
          //   load(ConetianDeath, {
          //     autoplay: true,
          //   })
          setGameStatus(1);
        }
      });

      drawBird();
      drawPipes();
      moveBackground();

      if (pipes.length === 0)
        addPipe();

      if (canvas.width - pipes[pipes.length - 1]?.x >= 500) {
        addPipe();
      }

      // move fire
      if (frame % 7 === 0)
        flyBird++;

      if (gameStatus === 0 || gameStatus === 3) {
        frame++;
        setGames({
          gameSpeed: gameSpeed,
          gameFrame: gameFrame,
          gravity: gravity,
          bird: bird,
          pipes: pipes,
          frame: frame,
          score: flagScore,
        });
      }

    };

    const jumpConetian = () => {
      if (gameStatus === 0 || gameStatus === 3) {
        if (audio) {
          // load(Tap, {
          //   autoplay: true,
          // })
        }

        bird.dy = -10;
      }
    }

    const handleMouseClick = () => jumpConetian();

    const handleSpaceBarPress = (event: KeyboardEvent) => {
      if (event.code === 'Space')
        jumpConetian();
    }

    window.addEventListener('mousedown', handleMouseClick);
    window.addEventListener('keyup', handleSpaceBarPress);

    const gameInterval = setInterval(update, 20);

    return () => {
      window.removeEventListener('mousedown', handleMouseClick);
      window.removeEventListener('keyup', handleSpaceBarPress);
      clearInterval(gameInterval);
    };
  }, [gameStatus]);


  useEffect(() => {
    setScores(score);
  }, [score])

  return (
    <div style={{ overflow: 'hidden', height: "100vh" }}>
      <canvas ref={canvasRef} />
      {/* {
        audio &&
        <audio src={BackgroundAudio} ref={backAudioRef} loop />
      } */}
    </div>
  );
};

export default Game;