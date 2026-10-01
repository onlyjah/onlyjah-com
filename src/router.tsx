// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadDelay: 100,
    defaultPreloadStaleTime: 29_000, /*30s -- default*/

    /* 
     * 
     * To let an external cache make the freshness decision, 
     * set routerOptions.defaultPreloadStaleTime 
     * or routeOptions.preloadStaleTime to 0. 
     * 
     * Settled preload data then becomes immediately stale in 
     * the Router, while retention still follows preloadGcTime. 
     * 
     * Overlapping preload or navigation 
     * consumers can still share in-flight loader work, 
     * and shouldReload can still suppress a loader call.
     * 
     * This would then allow you, for instance, to use 
     * an option like React Query's staleTime to 
     * control the freshness of your preloads.
    */



  })

  return router
}