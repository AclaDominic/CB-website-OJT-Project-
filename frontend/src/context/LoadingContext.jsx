import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../lib/axios';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(0);

    useEffect(() => {
        const reqInterceptor = axiosClient.interceptors.request.use(
            (config) => {
                if (!config.skipLoading) {
                    setLoadingCount(prev => prev + 1);
                }
                return config;
            },
            (error) => {
                // We can't easily check config here, but usually request error happens before interceptor?
                // Actually if request fails, we should probably decrement if we incremented.
                // But typically request error in interceptor means config failed.
                // Let's be safe: if we don't know, we don't decrement? 
                // Or better: we assume if it hit here, it might have incremented?
                // Actually, for simplicity and safety against stuck loaders:
                // If we can't check config, we might decrement just in case, or check error.config
                if (error.config && !error.config.skipLoading) {
                    setLoadingCount(prev => prev - 1);
                }
                return Promise.reject(error);
            }
        );

        const resInterceptor = axiosClient.interceptors.response.use(
            (response) => {
                if (!response.config.skipLoading) {
                    setLoadingCount(prev => Math.max(0, prev - 1));
                }
                return response;
            },
            (error) => {
                if (error.config && !error.config.skipLoading) {
                    setLoadingCount(prev => Math.max(0, prev - 1));
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosClient.interceptors.request.eject(reqInterceptor);
            axiosClient.interceptors.response.eject(resInterceptor);
        };
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading: loadingCount > 0 }}>
            {children}
        </LoadingContext.Provider>
    );
};
