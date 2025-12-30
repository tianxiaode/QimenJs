import { ErrorParser } from './ErrorParser';
import { HttpResponse, HttpError } from '../core/types';

export class JsonErrorParser implements ErrorParser {
  parse(response: HttpResponse): HttpError | null {
    if (response.isJsonResponse()) {
      const body = response.getBody();
      if (body.errorCode && body.errorMessage) {
        return new HttpError(response.statusCode, body.errorMessage, body);
      }
    }
    return null;
  }
}
