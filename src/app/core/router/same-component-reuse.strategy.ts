import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

//He creado esta Strategy para que detecte si es el mismo componente al cambiar de idioma para no hacer peticiones de nuevo.
export class SameComponentReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot,
  ): boolean {
    const futureConf = future.routeConfig;
    const currentConf = current.routeConfig;

    if (futureConf === currentConf) return true;
    if (!futureConf || !currentConf) return false;

    return (
      (futureConf.loadComponent === currentConf.loadComponent && !!futureConf.loadComponent) ||
      (futureConf.component === currentConf.component && !!futureConf.component)
    );
  }
}
