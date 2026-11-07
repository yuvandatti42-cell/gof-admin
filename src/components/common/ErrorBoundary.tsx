import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf5ea] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#dfd5bf] shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#103b1d]">Something went wrong</h2>
              <p className="text-xs text-[#5a6e54] mt-1">
                The portal encountered a minor display issue. Your store data is completely safe.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-[#faf5ea] rounded-xl text-left text-xs font-mono text-[#7a4100] border border-[#dfd5bf] overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-white border border-[#dfd5bf] hover:bg-[#faf5ea] text-[#103b1d] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#18542a] hover:bg-[#103b1d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
