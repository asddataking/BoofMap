import type { Doc } from "../_generated/dataModel";

export function reportToApi(r: Doc<"reports">) {
  return {
    id: r._id as string,
    user_id: r.userId,
    product_type: r.productType,
    brand_name: r.brandName,
    dispensary_name: r.dispensaryName,
    city: r.city,
    strain_name: r.strainName,
    price_paid: r.pricePaid ?? null,
    package_date: r.packageDate ?? null,
    issue_tags: r.issueTags,
    boof_score: r.boofScore,
    notes: r.notes ?? null,
    latitude: r.latitude,
    longitude: r.longitude,
    confirm_count: r.confirmCount,
    downvote_count: r.downvoteCount,
    image_url: r.imageUrl ?? null,
    status: r.status,
    created_at: new Date(r.createdAt).toISOString(),
  };
}

export function tickerToApi(t: Doc<"tickerItems">) {
  return {
    id: t._id as string,
    title: t.title,
    type: t.type,
    state: t.state ?? null,
    city: t.city ?? null,
    product_name: t.productName ?? null,
    brand_name: t.brandName ?? null,
    severity: t.severity ?? null,
    created_at: new Date(t.createdAt).toISOString(),
    expires_at: t.expiresAt ? new Date(t.expiresAt).toISOString() : null,
    is_active: t.isActive,
  };
}

export function rankingToApi(r: Doc<"rankings">) {
  return {
    id: r._id as string,
    product_id: r.productId ?? null,
    product_name: r.productName,
    brand_name: r.brandName ?? null,
    category: r.category,
    state: r.state ?? null,
    score: r.score,
    previous_score: r.previousScore ?? null,
    movement: r.movement,
    report_count: r.reportCount,
    ranking_type: r.rankingType,
    trend: r.trend,
    updated_at: new Date(r.updatedAt).toISOString(),
  };
}

export function userProfileToApi(p: Doc<"userProfiles">) {
  return {
    user_id: p.userId,
    display_name: p.displayName ?? null,
    role_title: p.roleTitle,
    level: p.level,
    points: p.points,
    report_count: p.reportCount,
    streak_count: p.streakCount,
    accuracy_score: p.accuracyScore ?? null,
    badges: p.badges,
    updated_at: new Date(p.updatedAt).toISOString(),
  };
}

export function notificationPrefsToApi(p: Doc<"notificationPreferences">) {
  return {
    user_id: p.userId,
    enabled: p.enabled,
    state: p.state ?? null,
    categories: p.categories,
    followed_brands: p.followedBrands,
    followed_products: p.followedProducts,
    updated_at: new Date(p.updatedAt).toISOString(),
  };
}

export function meetupToApi(r: Doc<"meetupReports">) {
  return {
    id: r._id as string,
    user_id: r.userId,
    seller_display_name: r.sellerDisplayName,
    platform: r.platform,
    city: r.city,
    area: r.area ?? null,
    meetup_type: r.meetupType,
    issue_tags: r.issueTags,
    seller_signal: r.sellerSignal,
    notes: r.notes ?? null,
    latitude: r.latitude,
    longitude: r.longitude,
    confirm_count: r.confirmCount,
    image_url: r.imageUrl ?? null,
    status: r.status,
    public_warning: r.publicWarning ?? null,
    created_at: new Date(r.createdAt).toISOString(),
  };
}
