from transformers import VitsModel, AutoTokenizer
import scipy.io.wavfile
import torch
import os
import ffmpeg
import numpy as np
from typing import Optional, Literal
from tempfile import NamedTemporaryFile

class AudioGenerator:
    def __init__(
        self, 
        model_name: str = "facebook/mms-tts-yor",
        output_format: Literal["mp3", "ogg", "wav"] = "mp3",
        bitrate: str = "192k"
    ):
        """Initialize the audio generator with the specified model.
        
        Args:
            model_name (str): The name of the pre-trained model to use
            output_format (str): Audio format to save as ("mp3", "ogg", or "wav")
            bitrate (str): Audio bitrate (e.g. "192k", "256k")
        """
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.output_dir = "audio"
        self.output_format = output_format
        self.bitrate = bitrate
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize model and tokenizer
        self._load_model()

    def _load_model(self):
        """Load the model and tokenizer."""
        try:
            self.model = VitsModel.from_pretrained(self.model_name)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        except Exception as e:
            raise Exception(f"Failed to load model and tokenizer: {str(e)}")

    def _convert_audio(self, wav_data: np.ndarray, sample_rate: int, output_path: str):
        """Convert audio data to compressed format using ffmpeg.
        
        Args:
            wav_data (np.ndarray): Audio waveform data
            sample_rate (int): Audio sampling rate
            output_path (str): Path to save the compressed audio
        """
        try:
            # Create a temporary WAV file
            with NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                scipy.io.wavfile.write(
                    temp_wav.name,
                    rate=sample_rate,
                    data=wav_data
                )

                # Convert to desired format using ffmpeg
                stream = ffmpeg.input(temp_wav.name)
                stream = ffmpeg.output(
                    stream, 
                    output_path,
                    acodec='libmp3lame' if self.output_format == 'mp3' else 'libvorbis',
                    audio_bitrate=self.bitrate,
                    loglevel='error'  # Reduce ffmpeg output
                )
                ffmpeg.run(stream, overwrite_output=True)

            # Clean up temporary file
            os.unlink(temp_wav.name)

        except ffmpeg.Error as e:
            raise Exception(f"FFmpeg error: {str(e)}")

    def generate_audio(
        self, 
        text: str, 
        output_filename: Optional[str] = None,
        save_audio: bool = True
    ) -> tuple[int, torch.Tensor]:
        """Generate audio from the given text.
        
        Args:
            text (str): The text to convert to speech
            output_filename (str, optional): The filename to save the audio to
            save_audio (bool): Whether to save the audio file or just return the waveform
            
        Returns:
            tuple: (sampling_rate, waveform)
        """
        if not text:
            raise ValueError("Text cannot be empty")

        try:
            # Prepare input
            inputs = self.tokenizer(text, return_tensors="pt")
            
            # Generate audio
            with torch.no_grad():
                output = self.model(**inputs).waveform

            # Save audio if requested
            if save_audio:
                if output_filename is None:
                    # Create a filename based on the first few words
                    words = text[:20].replace(" ", "_")
                    output_filename = f"{words}.{self.output_format}"
                
                full_path = os.path.join(self.output_dir, output_filename)
                
                # Convert the audio using ffmpeg
                self._convert_audio(
                    output.numpy().squeeze(),
                    self.model.config.sampling_rate,
                    full_path
                )
                print(f"Audio saved to: {full_path}")

            return self.model.config.sampling_rate, output

        except Exception as e:
            raise Exception(f"Failed to generate audio: {str(e)}")

    def __call__(self, text: str, output_filename: Optional[str] = None) -> tuple[int, torch.Tensor]:
        """Convenience method to generate audio directly by calling the instance."""
        return self.generate_audio(text, output_filename)


if __name__ == "__main__":
    # Create an instance of the AudioGenerator with MP3 output
    generator = AudioGenerator(
        output_format="mp3",  # Can be "mp3", "ogg", or "wav"
        bitrate="192k"        # Adjust quality/size trade-off
    )

    # Example Yoruba text
    text = "Báwo ni o şe wà?"  # How are you?

    # Generate and save audio in MP3 format
    sampling_rate, waveform = generator.generate_audio(
        text,
        output_filename="greeting.mp3"
    )
    print(f"Generated audio with sampling rate: {sampling_rate}Hz")
