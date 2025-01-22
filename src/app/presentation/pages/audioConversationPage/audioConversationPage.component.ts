import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ChatMessageComponent,
  MyMessageComponent,
  TypingLoaderComponent,
  TextMessageBoxComponent,
  TextMessageBoxEvent,
  TextMessageBoxSelectComponent,
} from '@components/index';
import { Message } from '@interfaces/message.interface';
import { OpenAiService } from 'app/presentation/services/openai.service';

@Component({
  selector: 'app-audio-conversation-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChatMessageComponent,
    MyMessageComponent,
    TypingLoaderComponent,
    // TextMessageBoxSelectComponent,
  ],
  templateUrl: './audioConversationPage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AudioConversationPageComponent implements OnInit {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  transcription: string | null = null;
  feedback: string | null = null;
  audioSrc: string | null = null;
  recordingTimeout: any;

  public threadId = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.openAiService.createThread('audio-thread', true).subscribe((id) => {
      this.threadId.set(id);
    });
  }

  startRecording(): void {
    this.transcription = null;
    this.feedback = null;
    this.audioSrc = null;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.isRecording.set(true);
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.uploadAudio(audioBlob);
        };

        this.mediaRecorder.start();

        // Set a timeout to stop recording after 15 seconds
        this.recordingTimeout = setTimeout(() => {
          this.stopRecording();
        }, 15000);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  }

  stopRecording(): void {
    this.isRecording.set(false);
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      clearTimeout(this.recordingTimeout);
    }
  }

  public messages = signal<Message[]>([]);
  public isLoading = signal(false);
  public isRecording = signal(false);
  public openAiService = inject(OpenAiService);

  uploadAudio(audioBlob: Blob): void {
    const formData = new FormData();
    formData.append('file', audioBlob, 'user_audio.webm');
    this.isLoading.set(true);
    this.openAiService
      .audioToAudio(audioBlob, this.threadId()!)
      .subscribe(({ message, audioUrl }) => {
        this.isLoading.set(false);
        this.messages.update((prev) => [
          ...prev,
          {
            isGpt: true,
            text: message,
            audioUrl: audioUrl,
          },
        ]);
      });
  }
}
