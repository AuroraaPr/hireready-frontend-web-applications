import { HttpInterceptorFn } from '@angular/common/http';

export const autorizacionInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = localStorage.getItem('jwt');

  if (jwt && jwt !== '') {
    const authReq = req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + jwt,
      },
    });
    return next(authReq);
  }

  return next(req);
};
