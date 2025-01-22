import { environment } from 'environments/environment';

export const audioToAudioUseCase = async (
  audioBlob: Blob,
  threadId: string
) => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'user_audio.webm');

    const resp = await fetch(
      `${environment.assistantApi}/conversation?threadId=${threadId}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!resp.ok) throw new Error('No se pudo generar el audio');

    const audioFile = await resp.blob();
    const audioUrl = URL.createObjectURL(audioFile);

    return {
      ok: true,
      message: '',
      audioUrl: audioUrl,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: 'No se pudo generar el audio',
      audioUrl: '',
    };
  }
};
