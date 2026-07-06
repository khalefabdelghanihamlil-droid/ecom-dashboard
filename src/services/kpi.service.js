import { getFinanceResume, getCommandeStats, getClients } from './api.service';

/**
 * Service dédié à l'agrégation et au calcul des KPIs pour le Dashboard.
 * Sépare la logique de calcul des composants UI.
 */
class KpiService {
  /**
   * Récupère tous les KPIs du Dashboard (Fusion des données API et calculs frontend).
   * @param {string} storeId - ID de la boutique (pour l'architecture multi-boutiques future)
   */
  async getDashboardKpis(storeId = null) {
    try {
      // Appels parallèles pour optimiser le temps de chargement
      const [financeData, orderStats, clients] = await Promise.all([
        getFinanceResume(storeId).catch(() => ({ total_ca: 0, total_profit: 0, total_commandes: 0, roas_global: 0 })),
        getCommandeStats(storeId).catch(() => ({ total: 0, par_statut: {} })),
        getClients(storeId).catch(() => [])
      ]);

      // TODO Backend: Actuellement, certains KPIs sont calculés côté Frontend.
      // À l'avenir, une route globale /dashboard/kpis devra tout renvoyer directement.

      // --- Calculs Frontend temporaires ---
      
      const statsParStatut = orderStats?.par_statut || {};
      
      // Commandes en attente (en attente OTP ou non traitées)
      const pendingOrders = (statsParStatut['en_attente_otp'] || 0) + (statsParStatut['nouvelle'] || 0);
      
      // Commandes livrées
      const deliveredOrders = statsParStatut['livree'] || 0;
      
      // Taux de retour (Commandes retournées / Total des commandes)
      const returnedOrders = statsParStatut['retournee'] || 0;
      const totalOrders = orderStats?.total || 1; // Éviter la division par zéro
      const returnRate = totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : 0;
      
      // Nombre de clients
      const totalClients = clients.length || 0;

      // Formatage des résultats pour l'UI.
      // INTÉGRITÉ DES DONNÉES : les tendances (trend) sont laissées à `null` tant
      // qu'aucune source réelle n'existe. Afficher des pourcentages factices
      // (ex. « +12.5% ») induirait l'exploitant en erreur. StatCard n'affiche
      // simplement aucune tendance quand trend est null.
      // TODO Backend: exposer une route /dashboard/kpis renvoyant les vraies
      // évolutions (période N vs N-1) et renseigner ces champs `trend`.
      return {
        revenue: {
          value: financeData.total_ca || 0,
          label: "Chiffre d'Affaires",
          trend: null,
          isCurrency: true
        },
        profit: {
          value: financeData.total_profit || 0,
          label: "Profit Net",
          trend: null,
          isCurrency: true
        },
        orders: {
          value: financeData.total_commandes || 0,
          label: "Total Commandes",
          trend: null,
          isCurrency: false
        },
        roas: {
          value: financeData.roas_global || 0,
          label: "ROAS Global",
          trend: null,
          isCurrency: false
        },
        pending: {
          value: pendingOrders,
          label: "En Attente",
          trend: null,
          isCurrency: false
        },
        delivered: {
          value: deliveredOrders,
          label: "Livrées",
          trend: null,
          isCurrency: false
        },
        returnRate: {
          value: returnRate,
          label: "Taux de Retour",
          trend: null,
          isCurrency: false,
          suffix: '%'
        },
        clients: {
          value: totalClients,
          label: "Total Clients",
          trend: null,
          isCurrency: false
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des KPIs:', error);
      throw error;
    }
  }
}

const kpiService = new KpiService();
export default kpiService;
