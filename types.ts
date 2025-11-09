
export enum ContentType {
  DOCUMENT = 'documento',
  VIDEO = 'video',
  FORUM = 'foro',
  NEWS = 'noticia',
}

export enum Certification {
  VERIFIED = 'Verificado',
  PARTIAL = 'Parcial',
  UNVERIFIED = 'No Verificado',
}

export interface SearchResult {
  id: string;
  title: string;
  source: string;
  type: ContentType;
  certification: Certification;
  content: {
    data: string;
    image: string;
    full: string; // Could be a URL for an iframe or full text content
  };
  snippet: string;
}

export interface Flashcard {
  front: string;
  back: string;
  thumbnail: string;
}
