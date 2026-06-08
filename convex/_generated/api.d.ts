/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as admin from "../admin.js";
import type * as detections from "../detections.js";
import type * as intelligenceNotifications from "../intelligenceNotifications.js";
import type * as leaderboards from "../leaderboards.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_cityCoords from "../lib/cityCoords.js";
import type * as lib_featureFlags from "../lib/featureFlags.js";
import type * as lib_homeData from "../lib/homeData.js";
import type * as lib_intelligenceData from "../lib/intelligenceData.js";
import type * as lib_intelligencePipeline from "../lib/intelligencePipeline.js";
import type * as lib_intelligenceValidators from "../lib/intelligenceValidators.js";
import type * as lib_mappers from "../lib/mappers.js";
import type * as lib_moderation from "../lib/moderation.js";
import type * as lib_reportAlerts from "../lib/reportAlerts.js";
import type * as lib_sellerSignal from "../lib/sellerSignal.js";
import type * as lib_slugify from "../lib/slugify.js";
import type * as lib_tickerWrite from "../lib/tickerWrite.js";
import type * as lib_userProfile from "../lib/userProfile.js";
import type * as lib_validators from "../lib/validators.js";
import type * as marketReports from "../marketReports.js";
import type * as meetupReports from "../meetupReports.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as r2 from "../r2.js";
import type * as rankings from "../rankings.js";
import type * as referrals from "../referrals.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as signalEvents from "../signalEvents.js";
import type * as ticker from "../ticker.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  admin: typeof admin;
  detections: typeof detections;
  intelligenceNotifications: typeof intelligenceNotifications;
  leaderboards: typeof leaderboards;
  "lib/auth": typeof lib_auth;
  "lib/cityCoords": typeof lib_cityCoords;
  "lib/featureFlags": typeof lib_featureFlags;
  "lib/homeData": typeof lib_homeData;
  "lib/intelligenceData": typeof lib_intelligenceData;
  "lib/intelligencePipeline": typeof lib_intelligencePipeline;
  "lib/intelligenceValidators": typeof lib_intelligenceValidators;
  "lib/mappers": typeof lib_mappers;
  "lib/moderation": typeof lib_moderation;
  "lib/reportAlerts": typeof lib_reportAlerts;
  "lib/sellerSignal": typeof lib_sellerSignal;
  "lib/slugify": typeof lib_slugify;
  "lib/tickerWrite": typeof lib_tickerWrite;
  "lib/userProfile": typeof lib_userProfile;
  "lib/validators": typeof lib_validators;
  marketReports: typeof marketReports;
  meetupReports: typeof meetupReports;
  notifications: typeof notifications;
  profiles: typeof profiles;
  r2: typeof r2;
  rankings: typeof rankings;
  referrals: typeof referrals;
  reports: typeof reports;
  seed: typeof seed;
  signalEvents: typeof signalEvents;
  ticker: typeof ticker;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
