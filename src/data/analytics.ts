import { Respondent, surveyQuestions, knownHistoricalKeys } from './surveyData';
import imageMap from './imageMap.json';

export interface OptionStat {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalysis {
  id: string;
  title: string;
  type: string;
  totalAnswered: number;
  optionsStats: OptionStat[];
  textAnswers?: { buque: string; famss: string; text: string; activeBuilder: boolean }[];
}

export interface VoterInfo {
  buque: string;
  famss: string;
  isMotivss: boolean;
}

export interface KeyRanking {
  keyId: string;
  label: string;
  center: string;
  year: string;
  description: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  superlikes: number;
  totalInteractions: number;
  score: number;
  likeDislikeRatio: number | null;
  approvalRate: number;
  superlikeQuotes: { buque: string; famss: string; element?: string; reason?: string }[];
  likedBy: VoterInfo[];
  dislikedBy: VoterInfo[];
  superlikedBy: (VoterInfo & { element?: string; reason?: string })[];
}

export interface QualitativeCluster {
  tag: string;
  label: string;
  count: number;
  color: string;
  description: string;
  examples: { buque: string; famss: string; text: string; source: string }[];
}

export interface SwipeHistogramBin {
  range: string;
  label: string;
  count: number;
  percentage: number;
}

export interface FormAnalytics {
  targetAudience: number;
  totalRespondents: number;
  participationRate: number;
  quorum50Remaining: number;

  overallCompletedRequired: number;
  overallCompletedRequiredRate: number;
  overall100PercentCompleted: number;
  overall100PercentCompletedRate: number;

  part1: {
    answeredRequiredCount: number;
    answeredRequiredRate: number;
    answeredOpenQuestionsCount: number;
    answeredOpenQuestionsRate: number;
    avgQuestionsAnswered: number;
  };

  part2: {
    answeredRequiredCount: number;
    answeredRequiredRate: number;
    answeredOpenQuestionsCount: number;
    answeredOpenQuestionsRate: number;
    avgQuestionsAnswered: number;
  };

  swipeMetrics: {
    totalSwipes: number;
    avgSwipesPerUser: number;
    medianSwipesPerUser: number;
    minSwipes: number;
    maxSwipes: number;
    usersWithSwipesCount: number;
    usersWithSwipesRate: number;
    histogram: SwipeHistogramBin[];
    totalLikes: number;
    totalDislikes: number;
    totalSuperlikes: number;
    likeRate: number;
    dislikeRate: number;
    superlikeRate: number;
    globalRatio: number | null;
    usersWithSuperlikeCount: number;
    usersWithSuperlikeRate: number;
    totalSuperlikeNotes: number;
  };

  timeMetrics: {
    totalMinutes: number;
    timeFormatted: string;
    medianMinutes: number | null;
    avgMinutes: number | null;
    singleSessionCount: number;
    excludedOutliersCount: number;
  };
}

export function computeStats(respondentsList: Respondent[]) {
  const total = respondentsList.length;
  const targetAudience = 163;
  const participationRate = total > 0 ? Math.round((total / targetAudience) * 1000) / 10 : 0;
  const quorum50Remaining = Math.max(0, Math.ceil(targetAudience * 0.5) - total);

  // Compute stats per question
  const questionsMap: Record<string, QuestionAnalysis> = {};

  surveyQuestions.forEach((q) => {
    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      const counts: Record<string, number> = {};
      q.options?.forEach((opt) => {
        counts[opt.value] = 0;
      });

      let answeredCount = 0;
      respondentsList.forEach((r) => {
        const val = r.answers?.[q.id as keyof typeof r.answers];
        if (val) {
          if (Array.isArray(val) && val.length > 0) {
            answeredCount++;
            val.forEach((item) => {
              counts[item] = (counts[item] || 0) + 1;
            });
          } else if (typeof val === 'string' && val.trim() !== '') {
            answeredCount++;
            counts[val] = (counts[val] || 0) + 1;
          }
        }
      });

      const optionsStats: OptionStat[] = (q.options || []).map((opt) => ({
        value: opt.value,
        label: opt.label,
        count: counts[opt.value] || 0,
        percentage: answeredCount > 0 ? Math.round(((counts[opt.value] || 0) / answeredCount) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      questionsMap[q.id] = {
        id: q.id,
        title: q.title,
        type: q.type,
        totalAnswered: answeredCount,
        optionsStats
      };
    } else {
      const textList: { buque: string; famss: string; text: string; activeBuilder: boolean }[] = [];
      respondentsList.forEach((r) => {
        const val = r.answers?.[q.id as keyof typeof r.answers];
        if (typeof val === 'string' && val.trim() !== '') {
          textList.push({
            buque: r.buque,
            famss: r.famss,
            text: val.trim(),
            activeBuilder: r.answers?.post_interet === 'envie_investir_activement'
          });
        }
      });

      questionsMap[q.id] = {
        id: q.id,
        title: q.title,
        type: q.type,
        totalAnswered: textList.length,
        optionsStats: [],
        textAnswers: textList
      };
    }
  });

  // Detailed Form Completion & Exploration Metrics
  let p1ReqCount = 0;
  let p1OpenCount = 0;
  let p1TotalQuestionsAnswered = 0;

  let p2ReqCount = 0;
  let p2OpenCount = 0;
  let p2TotalQuestionsAnswered = 0;

  let fullRequiredCompletedCount = 0;
  let allQuestionsCompletedCount = 0;

  const swipesCountsPerUser: number[] = [];
  let totalLikes = 0;
  let totalDislikes = 0;
  let totalSuperlikes = 0;
  let usersWithSuperlike = 0;
  let totalSuperlikeNotes = 0;

  const singleSessionDurations: number[] = [];
  let excludedOutliersCount = 0;

  respondentsList.forEach((r) => {
    const ans = r.answers || {};

    // Part 1
    const hasP1Req = Boolean(ans.pre_connaissance && ans.pre_importance);
    if (hasP1Req) p1ReqCount++;

    const hasP1Open = Boolean((ans.pre_representation && ans.pre_representation.trim()) || (ans.pre_representation_promss && ans.pre_representation_promss.trim()));
    if (hasP1Open) p1OpenCount++;

    let p1Answered = 0;
    if (ans.pre_connaissance) p1Answered++;
    if (ans.pre_importance) p1Answered++;
    if (ans.pre_representation?.trim()) p1Answered++;
    if (ans.pre_representation_promss?.trim()) p1Answered++;
    p1TotalQuestionsAnswered += p1Answered;

    // Swipes
    const userSwipes = Object.values(r.swipes || {});
    const swipeCount = userSwipes.length;
    swipesCountsPerUser.push(swipeCount);

    let userSuperlikes = 0;
    userSwipes.forEach((reaction) => {
      if (reaction === 'like') totalLikes++;
      if (reaction === 'dislike') totalDislikes++;
      if (reaction === 'superlike') {
        totalSuperlikes++;
        userSuperlikes++;
      }
    });
    if (userSuperlikes > 0) usersWithSuperlike++;
    totalSuperlikeNotes += Object.keys(r.superlikeNotes || {}).length;

    // Part 2
    const hasP2Req = Boolean(
      ans.post_interet &&
      ans.post_elements_vus && ans.post_elements_vus.length > 0 &&
      ans.post_taille_signification && ans.post_taille_signification.length > 0 &&
      ans.post_materiaux && ans.post_materiaux.length > 0 &&
      ans.post_innovation && ans.post_innovation.length > 0
    );
    if (hasP2Req) p2ReqCount++;

    const hasP2Open = Boolean((ans.post_originalite && ans.post_originalite.trim()) || (ans.post_boite_a_idees && ans.post_boite_a_idees.trim()));
    if (hasP2Open) p2OpenCount++;

    let p2Answered = 0;
    if (ans.post_interet) p2Answered++;
    if (ans.post_elements_vus?.length) p2Answered++;
    if (ans.post_taille_signification?.length) p2Answered++;
    if (ans.post_materiaux?.length) p2Answered++;
    if (ans.post_innovation?.length) p2Answered++;
    if (ans.post_originalite?.trim()) p2Answered++;
    if (ans.post_boite_a_idees?.trim()) p2Answered++;
    p2TotalQuestionsAnswered += p2Answered;

    if (hasP1Req && swipeCount > 0 && hasP2Req) {
      fullRequiredCompletedCount++;
    }

    if (p1Answered === 4 && swipeCount > 0 && p2Answered === 7) {
      allQuestionsCompletedCount++;
    }

    // Time calculation:
    // Excluding respondents who returned later (> 45 min between submittedAt and updatedAt)
    if (r.submittedAt && r.updatedAt) {
      const diffMs = new Date(r.updatedAt).getTime() - new Date(r.submittedAt).getTime();
      const diffMinutes = Math.round(diffMs / 60000);
      if (diffMinutes >= 1 && diffMinutes <= 45) {
        singleSessionDurations.push(diffMinutes);
      } else if (diffMinutes > 45) {
        excludedOutliersCount++;
      }
    }
  });

  // Swipe Histogram Distribution CONDENSÉE PAR TRANCHES DE 15
  const maxInSwipes = Math.max(...swipesCountsPerUser, 0);
  const histogram: SwipeHistogramBin[] = [];

  const bin0 = swipesCountsPerUser.filter((c) => c === 0).length;
  histogram.push({
    range: '0',
    label: '0 clé (sauté)',
    count: bin0,
    percentage: total > 0 ? Math.round((bin0 / total) * 100) : 0
  });

  // Tranches de 15: 1-15, 16-30, 31-45, 46-60...
  const maxRange15 = Math.max(30, Math.ceil(maxInSwipes / 15) * 15);
  for (let lower = 1; lower <= maxRange15; lower += 15) {
    const upper = lower + 14;
    const count = swipesCountsPerUser.filter((c) => c >= lower && c <= upper).length;
    histogram.push({
      range: `${lower}-${upper}`,
      label: `${lower} à ${upper} clés`,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    });
  }

  const totalSwipes = swipesCountsPerUser.reduce((a, b) => a + b, 0);
  const avgSwipesPerUser = total > 0 ? Math.round((totalSwipes / total) * 10) / 10 : 0;
  
  const sortedSwipes = [...swipesCountsPerUser].sort((a, b) => a - b);
  const medianSwipesPerUser = total > 0 ? sortedSwipes[Math.floor(total / 2)] : 0;
  const minSwipes = total > 0 ? sortedSwipes[0] : 0;
  const maxSwipes = total > 0 ? sortedSwipes[total - 1] : 0;
  const usersWithSwipesCount = swipesCountsPerUser.filter((c) => c > 0).length;

  const totalVotes = totalLikes + totalDislikes + totalSuperlikes;
  const likeRate = totalVotes > 0 ? Math.round((totalLikes / totalVotes) * 100) : 0;
  const dislikeRate = totalVotes > 0 ? Math.round((totalDislikes / totalVotes) * 100) : 0;
  const superlikeRate = totalVotes > 0 ? Math.round((totalSuperlikes / totalVotes) * 100) : 0;
  const globalRatio = totalDislikes > 0 ? Math.round((totalLikes / totalDislikes) * 10) / 10 : null;

  // Time metrics (single session without outliers who returned later)
  const sortedDurations = [...singleSessionDurations].sort((a, b) => a - b);
  const totalParticipationMinutes = singleSessionDurations.reduce((a, b) => a + b, 0);
  const totalHours = Math.floor(totalParticipationMinutes / 60);
  const remainingMinutes = totalParticipationMinutes % 60;
  const timeFormatted = totalHours > 0 ? `${totalHours}h ${remainingMinutes}min` : `${totalParticipationMinutes} min`;

  const medianMinutes = sortedDurations.length > 0 ? sortedDurations[Math.floor(sortedDurations.length / 2)] : null;
  const avgMinutes = sortedDurations.length > 0 ? Math.round((totalParticipationMinutes / sortedDurations.length) * 10) / 10 : null;

  const formAnalytics: FormAnalytics = {
    targetAudience,
    totalRespondents: total,
    participationRate,
    quorum50Remaining,

    overallCompletedRequired: fullRequiredCompletedCount,
    overallCompletedRequiredRate: total > 0 ? Math.round((fullRequiredCompletedCount / total) * 100) : 0,
    overall100PercentCompleted: allQuestionsCompletedCount,
    overall100PercentCompletedRate: total > 0 ? Math.round((allQuestionsCompletedCount / total) * 100) : 0,

    part1: {
      answeredRequiredCount: p1ReqCount,
      answeredRequiredRate: total > 0 ? Math.round((p1ReqCount / total) * 100) : 0,
      answeredOpenQuestionsCount: p1OpenCount,
      answeredOpenQuestionsRate: total > 0 ? Math.round((p1OpenCount / total) * 100) : 0,
      avgQuestionsAnswered: total > 0 ? Math.round((p1TotalQuestionsAnswered / total) * 10) / 10 : 0
    },

    part2: {
      answeredRequiredCount: p2ReqCount,
      answeredRequiredRate: total > 0 ? Math.round((p2ReqCount / total) * 100) : 0,
      answeredOpenQuestionsCount: p2OpenCount,
      answeredOpenQuestionsRate: total > 0 ? Math.round((p2OpenCount / total) * 100) : 0,
      avgQuestionsAnswered: total > 0 ? Math.round((p2TotalQuestionsAnswered / total) * 10) / 10 : 0
    },

    swipeMetrics: {
      totalSwipes,
      avgSwipesPerUser,
      medianSwipesPerUser,
      minSwipes,
      maxSwipes,
      usersWithSwipesCount,
      usersWithSwipesRate: total > 0 ? Math.round((usersWithSwipesCount / total) * 100) : 0,
      histogram,
      totalLikes,
      totalDislikes,
      totalSuperlikes,
      likeRate,
      dislikeRate,
      superlikeRate,
      globalRatio,
      usersWithSuperlikeCount: usersWithSuperlike,
      usersWithSuperlikeRate: total > 0 ? Math.round((usersWithSuperlike / total) * 100) : 0,
      totalSuperlikeNotes
    },

    timeMetrics: {
      totalMinutes: totalParticipationMinutes,
      timeFormatted,
      medianMinutes,
      avgMinutes,
      singleSessionCount: singleSessionDurations.length,
      excludedOutliersCount
    }
  };

  // Swiper Key Ranking with WHO LIKED / WHO DISLIKED
  const keyStatsMap: Record<string, {
    likes: number;
    dislikes: number;
    superlikes: number;
    quotes: { buque: string; famss: string; element?: string; reason?: string }[];
    likedBy: VoterInfo[];
    dislikedBy: VoterInfo[];
    superlikedBy: (VoterInfo & { element?: string; reason?: string })[];
  }> = {};

  respondentsList.forEach((r) => {
    const isMotivss = r.answers?.post_interet === 'envie_investir_activement';

    Object.entries(r.swipes || {}).forEach(([keyId, reaction]) => {
      if (!keyStatsMap[keyId]) {
        keyStatsMap[keyId] = {
          likes: 0,
          dislikes: 0,
          superlikes: 0,
          quotes: [],
          likedBy: [],
          dislikedBy: [],
          superlikedBy: []
        };
      }
      if (reaction === 'like') {
        keyStatsMap[keyId].likes++;
        keyStatsMap[keyId].likedBy.push({ buque: r.buque, famss: r.famss, isMotivss });
      }
      if (reaction === 'dislike') {
        keyStatsMap[keyId].dislikes++;
        keyStatsMap[keyId].dislikedBy.push({ buque: r.buque, famss: r.famss, isMotivss });
      }
      if (reaction === 'superlike') {
        keyStatsMap[keyId].superlikes++;
        const note = r.superlikeNotes?.[keyId];
        const quoteObj = {
          buque: r.buque,
          famss: r.famss,
          element: note?.element || 'Coup de cœur',
          reason: note?.reason || ''
        };
        keyStatsMap[keyId].quotes.push(quoteObj);
        keyStatsMap[keyId].superlikedBy.push({
          buque: r.buque,
          famss: r.famss,
          isMotivss,
          element: note?.element,
          reason: note?.reason
        });
      }
    });
  });

  const imgMapTyped = imageMap as Record<string, string>;

  const keyRankings: KeyRanking[] = Object.entries(keyStatsMap).map(([keyId, data]) => {
    const totalInteractions = data.likes + data.dislikes + data.superlikes;
    const score = (data.superlikes * 3) + (data.likes * 1) - (data.dislikes * 1);
    const approvalRate = totalInteractions > 0 ? Math.round(((data.likes + data.superlikes) / totalInteractions) * 100) : 0;
    const ratio = data.dislikes === 0 ? (data.likes > 0 ? data.likes : null) : Math.round((data.likes / data.dislikes) * 10) / 10;
    
    const meta = knownHistoricalKeys[keyId] || {
      label: keyId.replace('photo_120_im_cl___cl', 'Clé Cluny ').replace('_jpg', '').replace('photo_', ''),
      center: 'Cluny',
      year: 'Historique',
      description: 'Clé patrimoniale issue des archives'
    };

    const imageUrl = imgMapTyped[keyId] || imgMapTyped[keyId.replace('photo_120_im_cl___cl', '').replace('_jpg', '')];

    return {
      keyId,
      label: meta.label,
      center: meta.center,
      year: meta.year,
      description: meta.description,
      imageUrl,
      likes: data.likes,
      dislikes: data.dislikes,
      superlikes: data.superlikes,
      totalInteractions,
      score,
      likeDislikeRatio: ratio,
      approvalRate,
      superlikeQuotes: data.quotes,
      likedBy: data.likedBy,
      dislikedBy: data.dislikedBy,
      superlikedBy: data.superlikedBy
    };
  }).sort((a, b) => b.score - a.score);

  // Clusters
  const textCorpus: { buque: string; famss: string; text: string; source: string }[] = [];
  ['pre_representation', 'pre_representation_promss', 'post_originalite', 'post_boite_a_idees'].forEach((qid) => {
    questionsMap[qid]?.textAnswers?.forEach((ans) => {
      textCorpus.push({ ...ans, source: qid });
    });
  });

  const clusterThemes = [
    { tag: "parpaing", label: "Le Parpaing", keywords: ["parpaing", "béton", "ciment"], color: "amber", description: "Ciment symbolique de la promotion" },
    { tag: "abbaye", label: "Abbaye & Clochers", keywords: ["abbaye", "clocher", "roman", "gothique", "moine"], color: "emerald", description: "Héritage architectural clunisois" },
    { tag: "time_capsule", label: "Capsule Temporelle", keywords: ["capsule", "temporelle", "cache", "lettre", "mot", "trappe", "secret"], color: "indigo", description: "Compartiment secret scellé pour 25 ans" },
    { tag: "belier_tour", label: "Bélier & Tour", keywords: ["bélier", "belier", "tour d'assaut", "siège"], color: "rose", description: "Cadal du Baptême et esprit guerrier" },
    { tag: "nuit_etoilee", label: "Nuit Étoilée", keywords: ["étoile", "van gogh", "projection", "ciel"], color: "sky", description: "Salle Conscrite Van Gogh et étoiles" },
    { tag: "bois_metal", label: "Bois & Métal", keywords: ["bois", "chêne", "métal", "bronze", "laiton"], color: "stone", description: "Ébénisterie et métaux nobles" },
    { tag: "lumiere", label: "Lumière & Vitraux", keywords: ["lumière", "éclairage", "rétroéclairage", "vitrail", "vitraux"], color: "yellow", description: "Effets lumineux et transparences" }
  ];

  const qualitativeClusters: QualitativeCluster[] = clusterThemes.map((theme) => {
    const matching = textCorpus.filter((item) => {
      const lower = item.text.toLowerCase();
      return theme.keywords.some((kw) => lower.includes(kw));
    });
    return {
      tag: theme.tag,
      label: theme.label,
      count: matching.length,
      color: theme.color,
      description: theme.description,
      examples: matching
    };
  }).sort((a, b) => b.count - a.count);

  return {
    total,
    targetAudience,
    participationRate,
    questionsMap,
    keyRankings,
    activeBuilders: respondentsList.filter((r) => r.answers?.post_interet === 'envie_investir_activement'),
    curiousConsultants: respondentsList.filter((r) => r.answers?.post_interet === 'curieux_voir_propositions'),
    lowInterest: respondentsList.filter((r) => r.answers?.post_interet === 'toujours_peu_interesse'),
    qualitativeClusters,
    formAnalytics,
    rawList: respondentsList
  };
}
