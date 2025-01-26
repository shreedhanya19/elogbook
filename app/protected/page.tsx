import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import CustomLayout from '../../components/customLayout';
import QRScanner from '../../components/QRScanner';

export default async function ProtectedPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <CustomLayout user={user}
    leftContent={
      <div>
        <h2 className="text-lg font-semibold">Left Section</h2>
        <button className="btn btn-primary">Primary Button</button>
        <QRScanner />
      </div>
    }
    topRightContent={
      
     <div>
        
     </div>
    }
    bottomRightContent={
      <div>
        <h2 className="text-lg font-semibold">Bottom Right Section</h2>
        <p>This is the bottom-right content.</p>
      </div>
    }
  />
    
  );
}
