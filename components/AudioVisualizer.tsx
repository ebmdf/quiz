import React, { useRef, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import type { VisualizerType } from '../types';

interface AudioVisualizerProps {
    color: string;
    type: VisualizerType;
    width?: number;
    height?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ color, type, width = 100, height = 35 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { analyserNode } = useSite();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !analyserNode || type === 'none') return;

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        let animationFrameId: number;

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);
            
            canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            if (type === 'wave') {
                analyserNode.fftSize = 2048;
                const bufferLength = analyserNode.fftSize;
                const dataArray = new Uint8Array(bufferLength);
                analyserNode.getByteTimeDomainData(dataArray);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = color;
                canvasCtx.beginPath();

                const sliceWidth = canvas.width * 1.0 / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * canvas.height / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }
                    x += sliceWidth;
                }
                canvasCtx.lineTo(canvas.width, canvas.height / 2);
                canvasCtx.stroke();
            } else { // bars or circle
                analyserNode.fftSize = 256;
                const bufferLength = analyserNode.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                analyserNode.getByteFrequencyData(dataArray);

                const barWidth = (canvas.width / bufferLength) * (type === 'bars' ? 1.5 : 2.5);
                let x = 0;
                
                if (type === 'circle') {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const radius = Math.min(centerX, centerY) * 0.3;
                    canvasCtx.beginPath();
                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = dataArray[i] / 4;
                        const angle = (i / bufferLength) * 2 * Math.PI;
                        const x1 = centerX + Math.cos(angle) * radius;
                        const y1 = centerY + Math.sin(angle) * radius;
                        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

                        canvasCtx.moveTo(x1, y1);
                        canvasCtx.lineTo(x2, y2);
                    }
                    canvasCtx.strokeStyle = color;
                    canvasCtx.lineWidth = barWidth;
                    canvasCtx.stroke();
                } else { // bars
                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = dataArray[i] / 2.5;
                        canvasCtx.fillStyle = color;
                        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                        x += barWidth + 1;
                    }
                }
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [analyserNode, color, type, width, height]);

    if (type === 'none') return null;

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default AudioVisualizer;