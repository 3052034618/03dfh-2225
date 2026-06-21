import { SearchForm } from '@/components/SearchForm';
import { WaybillTable } from '@/components/WaybillTable';
import { StatsCard } from '@/components/StatsCard';
import { useAppStore } from '@/store/useAppStore';
import { Package, Route, ThermometerSun, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SearchPage = () => {
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">运单检索</h1>
          <p className="text-neutral-500 mt-1">
            输入运单号、客户名称或发货日期，快速查询运单信息
          </p>
        </div>
      </div>

      <SearchForm />

      {selectedWaybill && (
        <>
          <StatsCard />

          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-500" />
                    运单详情
                  </h3>
                  <span className="font-mono text-sm bg-primary-100 text-primary-700 px-2.5 py-1 rounded-md">
                    {selectedWaybill.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      客户名称
                    </p>
                    <p className="text-sm font-medium text-neutral-800">
                      {selectedWaybill.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                      <Route className="w-3 h-3" />
                      运输线路
                    </p>
                    <p className="text-sm font-medium text-neutral-800">
                      {selectedWaybill.route}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      货品类型
                    </p>
                    <p className="text-sm font-medium text-neutral-800">
                      {selectedWaybill.goodsType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                      <ThermometerSun className="w-3 h-3" />
                      要求温区
                    </p>
                    <p className="text-sm font-mono font-medium text-neutral-800">
                      {selectedWaybill.tempMin}°C ~ {selectedWaybill.tempMax}°C
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-6">
                <Link
                  to={`/trace/${selectedWaybill.id}`}
                  className="btn-primary"
                >
                  <ThermometerSun className="w-4 h-4 mr-2" />
                  查看温度留痕
                </Link>
                <Link
                  to={`/certificate/${selectedWaybill.id}`}
                  className="btn-secondary"
                >
                  生成证明材料
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <WaybillTable />
    </div>
  );
};
