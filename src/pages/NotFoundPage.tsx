import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
          <Activity className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-700">Health Topic Not Found</h2>
          <p className="text-xs text-slate-500">
            The page or health guide you are seeking does not exist or has been moved.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/">
            <Button size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="outline" size="md">
              Start Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
