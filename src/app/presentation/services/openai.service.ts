import { Injectable } from '@angular/core';
import {
  orthographyUseCase,
  translateTextUseCase,
  prosConsStreamUseCase,
  prosConsUseCase,
  textToAudioUseCase,
  audioToTextUseCase,
  imageGenerationUseCase,
  imageVariationUseCase,
  createThreadUseCase,
  postQuestionUseCase,
  audioToAudioUseCase,
} from '@use-cases/index';
import { Observable, from, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OpenAiService {
  checkOrthography(prompt: string) {
    return from(orthographyUseCase(prompt));
  }

  prosConsDiscusser(prompt: string) {
    return from(prosConsUseCase(prompt));
  }

  prosConsStreamDiscusser(prompt: string, abortSignal: AbortSignal) {
    return prosConsStreamUseCase(prompt, abortSignal);
  }

  translateText(prompt: string, lang: string) {
    return from(translateTextUseCase(prompt, lang));
  }

  textToAudio(prompt: string, voice: string) {
    return from(textToAudioUseCase(prompt, voice));
  }

  audioToText(file: File, prompt?: string) {
    return from(audioToTextUseCase(file, prompt));
  }

  audioToAudio(audioBlob: Blob, threadId: string) {
    return from(audioToAudioUseCase(audioBlob, threadId));
  }

  imageGeneration(prompt: string, originalImage?: string, maskImage?: string) {
    return from(imageGenerationUseCase(prompt, originalImage, maskImage));
  }

  imageVariation(originalImage: string) {
    return from(imageVariationUseCase(originalImage));
  }

  createThread(id: string, audio: boolean): Observable<string> {
    if (localStorage.getItem(id)) {
      return of(localStorage.getItem(id)!);
    }

    return from(createThreadUseCase(audio)).pipe(
      tap((thread) => {
        localStorage.setItem(id, thread);
      })
    );
  }

  postQuestion(threadId: string, question: string) {
    return from(postQuestionUseCase(threadId, question));
  }
}
