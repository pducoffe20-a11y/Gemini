import { customerStories, storyMatchRules, CustomerStory } from "../data";

export interface MatchedStories {
  primaryKey: string;
  primaryStory: CustomerStory;
  alternates: Array<{ key: string; story: CustomerStory }>;
}

export function getStoryMatches(verticalId: string, hasCredential: boolean): MatchedStories {
  // Construct the lookup key matches
  const key = `${verticalId}__credential_${hasCredential}`;
  let primaryKey = storyMatchRules.vertical_to_primary_story[key];

  // If no primary story key found, try hasCredential backup or generic fallback
  if (!primaryKey) {
    const backupKey = `${verticalId}__credential_${!hasCredential}`;
    primaryKey = storyMatchRules.vertical_to_primary_story[backupKey];
  }

  // Fallback to absolute standard chain
  if (!primaryKey || !customerStories[primaryKey]) {
    if (hasCredential) {
      primaryKey = "isc2"; // high profile credential
    } else {
      primaryKey = "aacsb"; // high profile professional assoc
    }
  }

  const primaryStory = customerStories[primaryKey];

  // Filter alternates: same vertical tags, up to 2 distinct stories (excluding primary)
  const alternates: Array<{ key: string; story: CustomerStory }> = [];
  
  Object.entries(customerStories).forEach(([storyKey, story]) => {
    if (storyKey !== primaryKey) {
      const isSameVertical = story.vertical_tags.includes(verticalId);
      const satisfiesCredential = hasCredential ? story.credential_required : true;
      if (isSameVertical && satisfiesCredential) {
        alternates.push({ key: storyKey, story });
      }
    }
  });

  // If no same-vertical matches, fetch general ones from the fallback chain
  if (alternates.length === 0) {
    storyMatchRules.fallback_chain.forEach(fallbackKey => {
      if (fallbackKey !== primaryKey && customerStories[fallbackKey]) {
        alternates.push({ key: fallbackKey, story: customerStories[fallbackKey] });
      }
    });
  }

  return {
    primaryKey,
    primaryStory,
    alternates: alternates.slice(0, 2) // Max 2 alternates
  };
}
