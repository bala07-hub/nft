import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import GIF from 'gif.js.optimized';
import gifshot from 'gifshot';

const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY;

function GifEditor({ onComplete }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [baseGifs, setBaseGifs] = useState([]);
    const [selectedBaseGif, setSelectedBaseGif] = useState(null);

    const [stickerTerm, setStickerTerm] = useState("");
    const [stickers, setStickers] = useState([]);
    const [selectedStickers, setSelectedStickers] = useState([]); // array of sticker URLs

    const [overlayText, setOverlayText] = useState("");
    const [effect, setEffect] = useState("none"); // simple CSS filter
    const previewRef = useRef(null);

    // Automatically search for base GIFs
    useEffect(() => {
        const fetchGifs = async () => {
            try {
                if (!searchTerm.trim()) {
                    setBaseGifs([]);
                    return;
                }
                const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
                    searchTerm
                )}&limit=6`;
                const response = await axios.get(url);
                setBaseGifs(response.data.data);
            } catch (error) {
                console.error("Error searching base GIFs:", error);
            }
        };
        fetchGifs();
    }, [searchTerm]);

    // Automatically search for stickers
    useEffect(() => {
        const fetchStickers = async () => {
            try {
                if (!stickerTerm.trim()) {
                    setStickers([]);
                    return;
                }
                const url = `https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
                    stickerTerm
                )}&limit=6`;
                const response = await axios.get(url);
                setStickers(response.data.data);
            } catch (error) {
                console.error("Error searching stickers:", error);
            }
        };
        fetchStickers();
    }, [stickerTerm]);

    // Select base GIF (add crossOrigin attribute to images)
    const selectBaseGif = (gifUrl) => {
        setSelectedBaseGif(gifUrl);
    };

    // Add sticker to the composition
    const addSticker = (stickerUrl) => {
        setSelectedStickers((prev) => [...prev, stickerUrl]);
    };

    // Use gif.js to capture multiple frames and render an animated GIF
    // Updated frame capture inside handleCompleteAnimation:
    const handleCompleteAnimation = async () => {
        if (!selectedBaseGif) {
            alert("Please select a base GIF first.");
            return;
        }
        if (!previewRef.current) return;

        const numFrames = 20; // Increased number of frames
        const delayMs = 200;  // Increased delay between frames (milliseconds)
        let frames = [];

        for (let i = 0; i < numFrames; i++) {
            try {
                const canvas = await html2canvas(previewRef.current, {
                    backgroundColor: null,
                    useCORS: true,
                });
                frames.push(canvas.toDataURL("image/png"));
                // Wait before capturing the next frame
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            } catch (error) {
                console.error("Error capturing frame:", error);
            }
        }

        gifshot.createGIF(
            {
                images: frames,
                gifWidth: previewRef.current.offsetWidth,
                gifHeight: previewRef.current.offsetHeight,
                interval: delayMs / 1000,
                numFrames: numFrames,
            },
            function (obj) {
                if (!obj.error) {
                    const animatedGif = obj.image; // Data URL of the animated GIF
                    onComplete(animatedGif);
                } else {
                    console.error("GIF creation error:", obj.error);
                    alert("Failed to create animated GIF.");
                }
            }
        );
    };


    return (
        <div style={{ border: "1px solid #ccc", padding: 10, marginTop: 20 }}>
            <h3>Advanced GIF Editor (Animated via gif.js)</h3>

            {/* Base GIF Search Field */}
            <div>
                <h4>1) Type to Search Base GIFs</h4>
                <input
                    type="text"
                    placeholder="Type to search for a GIF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
                    {baseGifs.map((gif) => (
                        <img
                            key={gif.id}
                            crossOrigin="anonymous"
                            src={gif.images.fixed_height_small.url}
                            alt=""
                            style={{
                                marginRight: 5,
                                marginBottom: 5,
                                border: selectedBaseGif === gif.images.original.url ? "3px solid red" : "none",
                                cursor: "pointer"
                            }}
                            onClick={() => selectBaseGif(gif.images.original.url)}
                        />
                    ))}
                </div>
            </div>

            <hr />

            {/* Sticker Search Field */}
            <div>
                <h4>2) Type to Search Stickers</h4>
                <input
                    type="text"
                    placeholder="Type to search for stickers..."
                    value={stickerTerm}
                    onChange={(e) => setStickerTerm(e.target.value)}
                    style={{ width: "100%", marginBottom: 10 }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
                    {stickers.map((st) => (
                        <img
                            key={st.id}
                            crossOrigin="anonymous"
                            src={st.images.fixed_height_small.url}
                            alt=""
                            style={{ marginRight: 5, marginBottom: 5, cursor: "pointer" }}
                            onClick={() => addSticker(st.images.original.url)}
                        />
                    ))}
                </div>
            </div>

            <hr />

            {/* Text & Effect */}
            <div>
                <h4>3) Add Text & Effect</h4>
                <label>Overlay Text: </label>
                <input
                    type="text"
                    placeholder="Your text here"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    style={{ marginLeft: 10 }}
                />
                <br /><br />
                <label>Effect: </label>
                <select value={effect} onChange={(e) => setEffect(e.target.value)} style={{ marginLeft: 10 }}>
                    <option value="none">None</option>
                    <option value="grayscale(1)">Grayscale</option>
                    <option value="blur(2px)">Blur</option>
                    <option value="sepia(1)">Sepia</option>
                    <option value="brightness(1.5)">Brightness</option>
                </select>
            </div>

            <hr />

            {/* Preview & Complete */}
            <div>
                <h4>4) Preview & Complete (Animated GIF)</h4>
                <div
                    ref={previewRef}
                    style={{
                        position: "relative",
                        width: "300px",
                        height: "300px",
                        overflow: "hidden",
                        border: "1px solid black",
                        marginBottom: 10,
                        filter: effect,
                        backgroundColor: "#fff"
                    }}
                >
                    {/* Base GIF */}
                    {selectedBaseGif && (
                        <img
                            crossOrigin="anonymous"
                            src={selectedBaseGif}
                            alt="Base GIF"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    )}

                    {/* Stickers */}
                    {selectedStickers.map((stUrl, idx) => (
                        <img
                            key={idx}
                            crossOrigin="anonymous"
                            src={stUrl}
                            alt="Sticker"
                            style={{
                                position: "absolute",
                                top: `${10 + idx * 50}px`,
                                left: `${10 + idx * 50}px`,
                                width: "80px",
                                height: "80px"
                            }}
                        />
                    ))}

                    {/* Text Overlay */}
                    {overlayText && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: 10,
                                left: 10,
                                color: "white",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                padding: "5px 10px",
                                borderRadius: 4,
                                fontWeight: "bold"
                            }}
                        >
                            {overlayText}
                        </div>
                    )}
                </div>

                {/* "Complete" button */}
                <button onClick={handleCompleteAnimation}>Complete</button>
            </div>
        </div>
    );
}

export default GifEditor;
