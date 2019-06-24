"use strict";

const net = require("net");

/**
 * Middleware that rewrites URLs for buckets specified via subdomain or host header
 */
module.exports = (disableVhost = false) =>
  function vhost(ctx, next) {
    const [match, bucket] =
      /^(?:(.+))?\.s3(-website)?([-.].+)?\.amazonaws\.com$/.exec(
        ctx.hostname
      ) || [];

    if (match) {
      // Handle requests for <bucket>.s3[-website][-<region>].amazonaws.com, if they arrive.
      if (bucket) {
        ctx.path = `/${bucket}${ctx.path}`;
      }
    } else if (!disableVhost && !net.isIP(ctx.hostname) && ctx.hostname !== "localhost") {
      ctx.state.vhost = true;
      // otherwise attempt to distinguish virtual host-style requests
      ctx.path = `/${ctx.hostname}${ctx.path}`;
    }

    return next();
  };
