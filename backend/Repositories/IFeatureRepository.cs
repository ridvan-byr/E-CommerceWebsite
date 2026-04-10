using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories
{
    public interface IFeatureRepository
    {
        Task<IReadOnlyList<Feature>> GetAllActiveAsync(CancellationToken cancellationToken = default);
        Task<Feature?> GetFeatureByIdAsync(int id,CancellationToken cancellationToken = default);
        Task AddAsync(Feature feature,CancellationToken cancellationToken = default);
        Task<Feature?> GetTrackedActiveByIdAsync(int id, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// İsme göre aktif özellik döner; yoksa oluşturur (benzersiz isim, yoksa yarışta tekrar okur).
        /// </summary>
        Task<Feature> GetOrCreateActiveByNameAsync(string name, CancellationToken cancellationToken = default);
    }

}