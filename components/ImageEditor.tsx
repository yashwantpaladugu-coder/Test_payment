
import React, { useState } from 'react';
import { editImage } from '../services/imageService';
import UploadIcon from './icons/UploadIcon';
import SparklesIcon from './icons/SparklesIcon';


const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{ file: File, url: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalImage({ file, url: URL.createObjectURL(file) });
            setEditedImage(null); // Clear previous edit
            setError(null);
        } else {
            setError("Please select a valid image file.");
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!originalImage || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const result = await editImage(originalImage.file, prompt);
            setEditedImage(result);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const ImagePlaceholder = ({ title }: { title: string }) => (
        <div className="w-full aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold">{title}</span>
        </div>
    );

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
            <div className="w-full max-w-4xl">
                {!originalImage && (
                    <div className="text-center mt-8">
                        <label htmlFor="image-upload" className="cursor-pointer inline-flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg hover:bg-gray-800 transition-colors">
                            <UploadIcon />
                            <span className="mt-4 text-lg font-semibold">Upload an Image</span>
                            <span className="text-sm text-gray-400">Click or drag and drop</span>
                        </label>
                        <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                )}

                {originalImage && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Original</h3>
                                <img src={originalImage.url} alt="Original" className="w-full aspect-square object-contain rounded-lg bg-gray-800" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Edited</h3>
                                {isLoading ? (
                                    <div className="w-full aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-600">
                                        <div className="loader"></div>
                                        <span className="text-sm font-semibold mt-4">Generating...</span>
                                    </div>
                                ) : editedImage ? (
                                    <img src={editedImage} alt="Edited" className="w-full aspect-square object-contain rounded-lg bg-gray-800" />
                                ) : (
                                    <ImagePlaceholder title="Edited Image" />
                                )}
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'Add a retro filter' or 'Make it look like a watercolor painting'"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon />
                                Generate
                            </button>
                        </form>
                         {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    </div>
                )}
            </div>
             <style>{`
                .loader {
                    border: 4px solid #f3f3f3; /* Light grey */
                    border-top: 4px solid #4f46e5; /* Indigo */
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    );
};

export default ImageEditor;
