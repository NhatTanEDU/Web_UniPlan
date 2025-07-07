import React from 'react';
import { Route } from 'react-router-dom';
import NotFound from '../pages/NotFound';

const NotFoundRoutes = () => (
  <>
   
   
    <Route path="/ai-assistant" element={<NotFound />} />
    <Route path="/upgrade" element={<NotFound />} />
    <Route path="/settings" element={<NotFound />} />    <Route path="/404" element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default NotFoundRoutes;
