using backend.Models.DTOs;
using backend.Models.DTOs.Suppliers;

namespace backend.Services;

public interface ISupplierService
{
    Task<PagedResponse<SupplierListDto>> GetSuppliersAsync(int limit, int offset);
    Task<SupplierDetailDto?> GetSupplierByIdAsync(string id);
}
